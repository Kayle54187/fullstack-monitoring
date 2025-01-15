const opentelemetry = require("@opentelemetry/sdk-node");
const { NodeSDK } = require("@opentelemetry/sdk-node");
const { Resource } = require("@opentelemetry/resources");
const {
  SemanticResourceAttributes,
} = require("@opentelemetry/semantic-conventions");
const { SimpleSpanProcessor } = require("@opentelemetry/sdk-trace-base");
const {
  getNodeAutoInstrumentations,
} = require("@opentelemetry/auto-instrumentations-node");
const {
  OTLPTraceExporter,
} = require("@opentelemetry/exporter-trace-otlp-http");
const {
  OTLPMetricExporter,
} = require("@opentelemetry/exporter-metrics-otlp-http");
const { PeriodicExportingMetricReader } = require("@opentelemetry/sdk-metrics");
const { LoggerProvider } = require("@opentelemetry/sdk-logs");
const { OTLPLogExporter } = require("@opentelemetry/exporter-logs-otlp-http");
const { BatchLogRecordProcessor } = require("@opentelemetry/sdk-logs");

const { NodeTracerProvider } = require('@opentelemetry/sdk-trace-node');
const { registerInstrumentations } = require('@opentelemetry/instrumentation');
const { SequelizeInstrumentation } = require('opentelemetry-instrumentation-sequelize');

const metricExporter = new OTLPMetricExporter({
  url: "http://localhost:4318/v1/metrics",
  headers: {},
});

const metricReader = new PeriodicExportingMetricReader({
  exporter: metricExporter,
  exportIntervalMillis: 1000,
});

const traceExporter = new OTLPTraceExporter({
  url: "http://localhost:4318/v1/traces",
  headers: {},
});

const logExporter = new OTLPLogExporter({
  url: "http://localhost:4318/v1/logs",
  headers: {},
});

const loggerProvider = new LoggerProvider({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: "lendors-backend",
    [SemanticResourceAttributes.SERVICE_VERSION]: "1.0.0",
    environment: "production",
  }),
});

loggerProvider.addLogRecordProcessor(new BatchLogRecordProcessor(logExporter));

const tracerProvider = new NodeTracerProvider({
  plugins: {
    sequelize: { enabled: false, path: 'opentelemetry-plugin-sequelize' }
  }
});

registerInstrumentations({
  tracerProvider,
  instrumentations: [
    new SequelizeInstrumentation({
      // see under for available configuration
    })
  ]
});

const sdk = new NodeSDK({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: "lendors-backend",
    [SemanticResourceAttributes.SERVICE_VERSION]: "1.0.0",
    environment: "production",
  }),
  traceExporter,
  metricReader,
  spanProcessor: new SimpleSpanProcessor(traceExporter),
  loggerProvider,
  instrumentations: [
    getNodeAutoInstrumentations({
      "@opentelemetry/instrumentation-fs": { enabled: true },
      "@opentelemetry/instrumentation-http": { enabled: true },
      "@opentelemetry/instrumentation-express": { enabled: true },
      "@opentelemetry/instrumentation-mongodb": { enabled: true },
      "@opentelemetry/instrumentation-redis": { enabled: true },
      "@opentelemetry/instrumentation-pg": { enabled: true },
      "@opentelemetry/instrumentation-mysql": { enabled: true },
    }),
    new SequelizeInstrumentation({
      // see under for available configuration
    })
  ],
});

// Initialize the SDK
sdk.start();

// Graceful shutdown
process.on("SIGTERM", () => {
  sdk
    .shutdown()
    .then(() => console.log("SDK shut down successfully"))
    .catch((error) => console.error("Error shutting down SDK", error))
    .finally(() => process.exit(0));
});

module.exports = sdk;