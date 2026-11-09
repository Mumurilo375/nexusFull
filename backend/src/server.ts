if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
  require("dotenv").config({
    path: require("path").resolve(process.cwd(), "../.env"),
    override: false,
  });
}
import app from "./app";
import { initializeBackendRuntime } from "./services/runtime.service";

const port = Number(process.env.PORT ?? 3000);

if (!process.env.VERCEL) {
  void initializeBackendRuntime()
    .then(() => {
      app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
      });
    })
    .catch((error: unknown) => {
      console.error("Failed to start server:", error);
      process.exit(1);
    });
}

export default app;
