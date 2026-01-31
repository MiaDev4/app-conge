const express = require ('express');
const mysql = require ('mysql2');
// TODO: Créer l'application Express
const app = express ();
app. use (express. urlencoded ({ extended: true })); 
app. set ('view engine','ejs');
// TODO: Créer la connexion MySQL   
const db = mysql.createConnection ({
    host: 'localhost',
    user: 'root',
    password: '@MA@04',
    database: 'demandes'
});
db.connect ((err) => {
    if (err) {
        console.log ('Erreur de connexion à la base de données:');
        return;
    }
    console.log ('Connecté à la base de données MySQL.');
});
app.get ('/conges', (req, res) => {
// TODO: récupérer employee code, SELECT, afficher demandes.
const sql = 'SELECT * FROM conges';
db. query (sql, (err, results) => {
    if (err) {  
        console. log ('Erreur lors de la récupération des demandes: ', err);
        return res.status (500).send ('Erreur serveur');
    }
      res.render ('demandes', {demandes: results}) ;

});
});


// GET /conges/new
app.get ('/conges/new', (req, res)=> {
// TODO: Afficher le formulaire
res. render ('form', { demande: null, errors: null }) 
}) ;

// POST / conges
app.post ('/conges', (req, res) => {
    // TODO: récupérer données, valider dates, insérer(EN_ATTENTE)
const {employee_code,employee_name,start_date,end_date,motif} = req.body;
 if( !employee_code || !employee_name || !start_date || !end_date || !motif){
    return res.render ('form', { demande: req.body, errors: ['Tous les champs sont obligatoires']});
}
if( new Date(start_date) < new Date()){
    return res.render ('form', { demande: req.body, errors: ['La date de début doit être future']});
}
if( new Date(start_date) > new Date(end_date)){
    return res.render ('form', { demande: req.body, errors: ['Dates invalides']});
}
if( (new Date(end_date) - new Date(start_date)) / (1000 * 60 * 60 * 24) > 30){
    return res.render ('form', { demande: req.body, errors: ['La durée maximale est de 30 jours']});
} 
const sql = 'INSERT INTO conges (employee_code, employee_name, start_date, end_date, motif, status) VALUES (?, ?, ?, ?, ?, "EN_ATTENTE")';
db.query(sql, [employee_code,employee_name,start_date,end_date,motif], (err, results) => {
    if(err)throw err;
    res.redirect('/conges');
});
}) ;

// GET /conges/: id/edit
app. get ('/conges/:id/edit', (req, res) => {
// TODO: vérifier existence, vérifier status EN ATTENTE
const id = req.params.id;
const sql = 'SELECT * FROM conges WHERE id = ?';
db.query(sql, [id], (err, results) => {
    if(err)throw err;
    res.render('form', { demande:results[0], errors: [] });
});
}) ;

//  /conges/: id
app.post ('/conges/:id', (req, res) => {
// TODO: mise à jour si EN_ATTENTE res. redirect ('/conges');
const id = req.params.id;
let {employee_code,employee_name,start_date,end_date,motif} = req.body;
const sqlSelect = 'SELECT * FROM conges WHERE id = ?';
start_date = start_date || null;
end_date   = end_date   || null;
db.query(sqlSelect, [id], (err, results) => {
    if(err)throw err;
    if(results.length === 0){
        return res.status(404).send('Demande non trouvée');
    }
    const demande = results[0]; 
    if(demande.status !== 'EN_ATTENTE'){
        return res.status(400).send('Demande non modifiable');
    }
    const sqlUpdate = 'UPDATE conges SET employee_code = ?, employee_name = ?, start_date = ?, end_date = ?, motif = ? WHERE id = ?';
    db.query(sqlUpdate, [employee_code,employee_name,start_date,end_date,motif,id], (err, results) => {
        if(err)throw err;
        return res.redirect('/conges');
    });
});
}) ;

// POST /conges/: id/delete
app. post ('/conges/:id/delete', (req, res) => {
// TODO: suppression si EN_ATTENTE
const id = req.params.id;
const sqlSelect = 'SELECT * FROM conges WHERE id = ?';
db.query(sqlSelect, [id], (err, results) => {
    if(err)throw err;
    if(results.length === 0){
        return res.status(404).send('Demande non trouvée');
    }
    const demande = results[0];
    if(demande.status !== 'EN_ATTENTE'){
        return res.status(400).send('Demande non supprimable');
    }
    const sqlDelete = 'DELETE FROM conges WHERE id = ?';
    db.query(sqlDelete, [id], (err, results) => {
        if(err)throw err;
        res.redirect('/conges');
    });
});
});

// TODO: Démarrer le serveur sur le port 3000
app.listen (3000, () => {
    console. log ('Serveur démarré sur le port 3000');
});
