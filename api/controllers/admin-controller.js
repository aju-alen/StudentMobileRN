import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const parsePaging = (req) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const pageSize = Math.min(Math.max(parseInt(req.query.pageSize, 10) || 50, 1), 50);
  return { page, pageSize, skip: (page - 1) * pageSize };
};

export const getAdminStats = async (req, res, next) => {
  try {
    const [
      teachers,
      students,
      parents,
      organizations,
      pendingSubjects,
      confirmedPurchases,
      spendAgg,
    ] = await Promise.all([
      prisma.user.count({ where: { userType: 'TEACHER' } }),
      prisma.user.count({ where: { userType: 'STUDENT' } }),
      prisma.user.count({ where: { userType: 'PARENT' } }),
      prisma.organization.count(),
      prisma.subject.count({
        where: { subjectVerification: false, rejectedAt: null },
      }),
      prisma.stripePurchases.count({ where: { purchaseStatus: 'CONFIRMED' } }),
      prisma.stripePurchases.aggregate({
        where: { purchaseStatus: 'CONFIRMED' },
        _sum: { purchaseAmount: true },
      }),
    ]);

    return res.status(200).json({
      teachers,
      students,
      parents,
      organizations,
      pendingSubjects,
      confirmedPurchases,
      totalSpendMinor: spendAgg._sum.purchaseAmount || 0,
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

export const getAdminTeachers = async (req, res, next) => {
  try {
    const { page, pageSize, skip } = parsePaging(req);
    const q = typeof req.query.q === 'string' ? req.query.q.trim() : '';
    const where = {
      userType: 'TEACHER',
      ...(q
        ? {
            OR: [
              { name: { contains: q } },
              { email: { contains: q } },
            ],
          }
        : {}),
    };

    const [total, users] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
          teacherProfile: {
            select: {
              organizationRole: true,
              organization: {
                select: { orgName: true },
              },
              subjects: {
                select: {
                  subjectVerification: true,
                  rejectedAt: true,
                },
              },
            },
          },
        },
      }),
    ]);

    const teachers = users.map((user) => {
      const subjects = user.teacherProfile?.subjects || [];
      const verifiedSubjects = subjects.filter((s) => s.subjectVerification).length;
      const rejectedSubjects = subjects.filter((s) => Boolean(s.rejectedAt)).length;
      const pendingSubjects = subjects.filter(
        (s) => !s.subjectVerification && !s.rejectedAt
      ).length;
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
        organizationName: user.teacherProfile?.organization?.orgName || null,
        organizationRole: user.teacherProfile?.organizationRole || null,
        verifiedSubjects,
        pendingSubjects,
        rejectedSubjects,
      };
    });

    return res.status(200).json({ page, pageSize, total, teachers });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

export const getAdminOrganizations = async (req, res, next) => {
  try {
    const { page, pageSize, skip } = parsePaging(req);
    const q = typeof req.query.q === 'string' ? req.query.q.trim() : '';
    const where = q
      ? {
          OR: [
            { orgName: { contains: q } },
            { orgEmail: { contains: q } },
          ],
        }
      : {};

    const [total, organizations] = await Promise.all([
      prisma.organization.count({ where }),
      prisma.organization.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          orgName: true,
          orgEmail: true,
          orgWebsite: true,
          orgCapacity: true,
          createdAt: true,
          teamLead: {
            select: {
              user: {
                select: { name: true, email: true },
              },
            },
          },
          _count: {
            select: { members: true },
          },
        },
      }),
    ]);

    return res.status(200).json({
      page,
      pageSize,
      total,
      organizations: organizations.map((org) => ({
        id: org.id,
        orgName: org.orgName,
        orgEmail: org.orgEmail,
        orgWebsite: org.orgWebsite,
        orgCapacity: org.orgCapacity,
        memberCount: org._count.members,
        teamLeadName: org.teamLead?.user?.name || null,
        teamLeadEmail: org.teamLead?.user?.email || null,
        createdAt: org.createdAt,
      })),
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

export const getAdminParents = async (req, res, next) => {
  try {
    const { page, pageSize, skip } = parsePaging(req);
    const q = typeof req.query.q === 'string' ? req.query.q.trim() : '';
    const where = {
      userType: 'PARENT',
      ...(q
        ? {
            OR: [
              { name: { contains: q } },
              { email: { contains: q } },
            ],
          }
        : {}),
    };

    const [total, users] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
          parentProfile: {
            select: {
              links: {
                select: { status: true },
              },
            },
          },
        },
      }),
    ]);

    const parents = users.map((user) => {
      const links = user.parentProfile?.links || [];
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
        acceptedLinks: links.filter((l) => l.status === 'ACCEPTED').length,
        pendingLinks: links.filter((l) => l.status === 'PENDING').length,
      };
    });

    return res.status(200).json({ page, pageSize, total, parents });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

export const getAdminPurchases = async (req, res, next) => {
  try {
    const { page, pageSize, skip } = parsePaging(req);
    const q = typeof req.query.q === 'string' ? req.query.q.trim() : '';
    const where = {
      purchaseStatus: 'CONFIRMED',
      ...(q
        ? {
            OR: [
              { student: { user: { name: { contains: q } } } },
              { student: { user: { email: { contains: q } } } },
              { subject: { subjectName: { contains: q } } },
            ],
          }
        : {}),
    };

    const [total, rows] = await Promise.all([
      prisma.stripePurchases.count({ where }),
      prisma.stripePurchases.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { purchaseDate: 'desc' },
        select: {
          id: true,
          purchaseAmount: true,
          purchaseCurrency: true,
          purchaseDate: true,
          purchaseReceiptUrl: true,
          student: {
            select: {
              user: {
                select: { name: true, email: true },
              },
            },
          },
          subject: {
            select: { subjectName: true },
          },
        },
      }),
    ]);

    return res.status(200).json({
      page,
      pageSize,
      total,
      purchases: rows.map((row) => ({
        id: row.id,
        studentName: row.student?.user?.name || null,
        studentEmail: row.student?.user?.email || null,
        subjectName: row.subject?.subjectName || null,
        purchaseAmount: row.purchaseAmount,
        purchaseCurrency: row.purchaseCurrency,
        purchaseDate: row.purchaseDate,
        purchaseReceiptUrl: row.purchaseReceiptUrl,
      })),
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
};
