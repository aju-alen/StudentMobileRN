import bookingRoutes from "./routes/booking-routes.js";

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/subjects", subjectRoutes);
app.use("/api/bookings", bookingRoutes); 