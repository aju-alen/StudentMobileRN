import { createBrowserRouter, RouterProvider, Outlet, Navigate, useLocation } from 'react-router-dom'
import Header from './components/Header';
import Footer from './components/Footer';
import { lazy } from 'react';

// import TagManager from "react-gtm-module";
// import GoogleAnalytics from './components/GoogleAnalytics';

// const tagManagerArgs = {
//   gtmId: "GTM-MS8JP2FD", // Replace with your actual GTM ID
// };

// TagManager.initialize(tagManagerArgs);

const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const hideNavBarPages = ['/'];
  const isDynamicRoute = (path: string) => /^\/user-survey\/.+$/.test(path);
  const shouldHideNavBar = hideNavBarPages.includes(location.pathname) || isDynamicRoute(location.pathname);


  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", maxWidth: "100vw" }}>
      {shouldHideNavBar && <Header />}
      <div style={{ flex: 1 }}>
        {children}
      </div>
     {  <Footer />}  
       </div>
  );
};

const Home = lazy(() => import('./pages/home'));
const Login = lazy(() => import('./pages/login'));
const NotFound = lazy(() => import('./pages/404'));
const Dashboard = lazy(() => import('./pages/admin/Dashboard'));
const VerifySubject = lazy(() => import('./pages/admin/VerifySubject'));
const SingleReport = lazy(() => import('./pages/admin/SingleReport'));
const DeleteAccount = lazy(() => import('./pages/DeleteAccount'));

const App = () => {

  // Function to check if the user is authenticated


  const isSuperAdmin = () => {
    console.log(JSON.parse(localStorage.getItem('superAdminDetails') || '{}').isAdmin, 'isSuperAdmin in protected routes');
    return JSON.parse(localStorage.getItem('superAdminDetails') || '{}').isAdmin; // Change this according to your authentication mechanism
  };

  const SuperAdminProtectedRoute = ({ element }: { element: React.ReactNode }) => {
    if (isSuperAdmin()) {
      return element;
    } else {
      console.log(isSuperAdmin(), 'isSuperAdmin in FINALSprotected routes');
      console.log('User is not Super Admin');
      return <Navigate to="/404" />;
    }
  };

  const router = createBrowserRouter([
    {
      path: "/",
      element: (
        <Layout> {/* Render Layout component here */}
        {/* <GoogleAnalytics /> */}
          <Outlet />
        </Layout>
      ),
      children: [
        {
          index: true,
          element: <Home />,
        },
     
        {
          path: "/login",
          element: <Login />,
        },
        {
          path: "/delete-account-guide",
          element: <DeleteAccount />,
        },
        {
          path: "/super-admin/dashboard",
          element: <SuperAdminProtectedRoute element={<Dashboard />} />, // Wrap Dashboard inside ProtectedRoute
        },
        {
          path: "/super-admin/verify-subject/:subjectId",
          element: <SuperAdminProtectedRoute element={<VerifySubject />} />, // Wrap Dashboard inside ProtectedRoute
        },
        {
          path: "/super-admin/report/:reportId",
          element: <SuperAdminProtectedRoute element={<SingleReport />} />, // Wrap Dashboard inside ProtectedRoute
        },
        {
          path: "/404",
          element: <NotFound /> // Wrap Dashboard inside ProtectedRoute
        },
        {
          path: "*",  // Catch-all route for any unmatched URLs
          element: <Navigate to="/404" />
        }
      ]
    }
  ]);

  return <RouterProvider router={router} />;
};

export default App;