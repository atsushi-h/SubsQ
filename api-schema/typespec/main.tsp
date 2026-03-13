import "@typespec/http";
import "@typespec/openapi3";
import "./models/auth.tsp";
import "./models/common.tsp";
import "./models/user.tsp";
import "./models/subscription.tsp";
import "./models/payment-method.tsp";
import "./routes/auth.tsp";
import "./routes/users.tsp";
import "./routes/subscriptions.tsp";
import "./routes/payment-methods.tsp";

using TypeSpec.Http;

@service(#{
  title: "SubsQ API",
})
@server("http://localhost:8080", "Development server")
@server("https://api.subsq-app.com", "Production server")
namespace SubsQ;
