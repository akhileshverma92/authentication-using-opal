# OPAL Authorization Demo

This project demonstrates how to use OPAL (Open Policy Administration Layer) with OPA (Open Policy Agent) for dynamic authorization in a Node.js application. The application is a simple web server that checks if a user is authorized to view a document.

## Project Overview

- **OPA**: Policy engine that evaluates authorization policies.
- **OPAL**: Keeps OPA policies updated in real-time.
- **Node.js**: Backend server to handle API requests.

## Prerequisites

- Docker
- Node.js and npm
- Git

## Setup

### Step 1: Set Up the Project Environment

1. Create a project directory:
    ```bash
    mkdir opal-authorization-demo
    cd opal-authorization-demo
    ```

2. Initialize a Git repository:
    ```bash
    git init
    ```

### Step 2: Install and Configure OPA

1. Create a policy file `policy.rego` with the following content:
    ```rego
    package example.authz

    default allow = false

    allow {
      input.user == "alice"
      input.action == "view"
      input.resource == "document"
    }
    ```

2. Run OPA with Docker:
    ```bash
    docker run -d --name opa -p 8181:8181 openpolicyagent/opa:latest run --server
    ```

### Step 3: Set Up OPAL

1. Create OPAL configuration file `opal_config.yaml`:
    ```yaml
    opal:
      server:
        source:
          repo_url: "https://github.com/yourusername/opal-authorization-demo"
          branch: main
          paths:
            - policy.rego
      client:
        server_url: "http://opal-server:7002"
        policy_store_type: "OPA"
        opa_url: "http://localhost:8181"
    ```

2. Run OPAL server:
    ```bash
    docker run -d --name opal-server -p 7002:7002 -v $(pwd)/opal_config.yaml:/etc/opal/config.yaml authorizon/opal-server
    ```

3. Run OPAL client:
    ```bash
    docker run -d --name opal-client -v $(pwd)/opal_config.yaml:/etc/opal/config.yaml authorizon/opal-client
    ```

### Step 4: Integrate with a Node.js Application

1. Initialize a Node.js project:
    ```bash
    npm init -y
    ```

2. Install dependencies:
    ```bash
    npm install express axios body-parser
    ```

3. Create the application file `app.js`:
    ```javascript
    const express = require('express');
    const axios = require('axios');
    const bodyParser = require('body-parser');

    const app = express();
    app.use(bodyParser.json());

    app.post('/view_document', async (req, res) => {
      const user = req.body.user;
      const action = "view";
      const resource = "document";

      try {
        const response = await axios.post('http://localhost:8181/v1/data/example/authz', {
          input: { user, action, resource }
        });

        if (response.data.result) {
          res.status(200).json({ message: "Access granted" });
        } else {
          res.status(403).json({ message: "Access denied" });
        }
      } catch (error) {
        res.status(500).json({ message: "Internal server error", error: error.message });
      }
    });

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
    ```

4. Run the Node.js application:
    ```bash
    node app.js
    ```

### Step 5: Test the Authorization

1. Send a request to view document:
    ```bash
    curl -X POST http://localhost:3000/view_document -H "Content-Type: application/json" -d '{"user": "alice"}'
    ```
    - Expected response: `{"message": "Access granted"}`.

2. Test with an unauthorized user:
    ```bash
    curl -X POST http://localhost:3000/view_document -H "Content-Type: application/json" -d '{"user": "bob"}'
    ```
    - Expected response: `{"message": "Access denied"}`.

## Conclusion

In this project, we set up a basic authorization system using OPA and OPAL in a Node.js environment. The Node.js application checks authorization policies defined in OPA, which are dynamically updated by OPAL. This setup can be expanded with more complex policies, multiple services, and additional OPAL/OPA configurations as needed.

## Resources

- [OPA Documentation](https://www.openpolicyagent.org/docs/latest/)
- [OPAL Documentation](https://docs.opal.ac)
- [Express Documentation](https://expressjs.com/)
- [Axios Documentation](https://axios-http.com/docs/intro)
- 
