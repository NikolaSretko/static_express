const express = require('express');
const app = express();
const fs = require('fs');
require('dotenv').config();
const PORT = 420;


app.use((req, _, next) => {
    console.log("New Request", req.method, req.url);
    next();
});

app.use(express.static("/public"));

app.get("/", (_, res) => {
    res.sendFile(__dirname + "/public/pages/index.html")
})

app.get("/:pageName", (req, res) => {
    const pageName = req.params.pageName;
    res.sendFile(__dirname + `/public/pages/${pageName}.html`);
});

const basicAuth = require('basic-auth');

const authMiddleware = (req, res, next) => {
    const user = basicAuth(req);
    const adminUser = process.env.ADMIN_USER;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (user && user.name === adminUser && user.pass === adminPassword) {
        next();
    } else {
        res.set('WWW-Authenticate', 'Basic realm="Admin Bereich"');
        res.status(401).send('Zugriff verweigert');
    }
};
app.get("/admin", authMiddleware, (req, res) => {
    res.sendFile(__dirname + "/public/pages/admin.html");
});

app.get("/api/persons", (_, res) => {
    res.sendFile(__dirname + 'personData.json')
});

app.post("/api/persons", express.json(), (req, res) => {
    const newPerson = req.body;
    fs.readFile(__dirname + '/personData.json')
        .then(fileContent => {
            const persons = JSON.parse(fileContent.toString());
            persons.push(newPerson);
            return fs.writeFile(__dirname + '/personData.json', JSON.stringify(persons));
        })
        .then(() => {
            res.json(newPerson);
        })
        .catch(() => {
            res.status(500).send('Fehler beim Speichern der Daten');
        });
});


app.use((_, res) => {
    res.status(404).sendFile(__dirname + '/public/pages/error.html')
})

app.listen(PORT, () => {
    console.log(`Server läuft auf localhost${PORT}`);
})
