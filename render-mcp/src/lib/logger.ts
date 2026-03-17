import pino from "pino";
import type { AppConfig } from "../config/appConfig.js";

export function createLogger(config: AppConfig): pino.Logger {
  if (config.nodeEnv === "development") {
    return pino({
      name: config.server.name,
      level: config.logLevel,
      transport: {
        target: "pino-pretty",
        options: {
          colorize: true,
          ignore: "pid,hostname",
          destination: 2
        }
      }
    });
  }

  return pino(
    {
      name: config.server.name,
      level: config.logLevel
    },
    pino.destination(2)
  );
}
