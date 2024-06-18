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
  console.log(Server running on port ${PORT});
});
