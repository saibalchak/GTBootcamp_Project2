from flask import Flask, json, request, jsonify, render_template, redirect
from flask_sqlalchemy import SQLAlchemy
from dotenv import load_dotenv
import os

## DB Credentials
load_dotenv(".env")
DB_USER = os.getenv("DB_USER")
DB_PASSWD = os.getenv("DB_PASSWD")
DB_NAME = os.getenv("DB_NAME")

app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = f'postgresql://{DB_USER}:{DB_PASSWD}@localhost/{DB_NAME}'
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["DEBUG"] = os.getenv("DEBUG")
db = SQLAlchemy(app)

# Models
class Emission(db.Model):
    __tablename__ = "emission_data"
    id = db.Column(db.Integer, primary_key=True)
    state = db.Column(db.String())
    year = db.Column(db.String())
    emission_value = db.Column(db.Float)

class Temperature(db.Model):
    __tablename__ = "temperature_data"
    id = db.Column(db.Integer, primary_key=True)
    station = db.Column(db.String())
    latitude = db.Column(db.Float)
    longitude = db.Column(db.Float)
    year = db.Column(db.String())
    tavg = db.Column(db.Float)

# routes
# html routes
@app.route("/")
def index():
    return render_template("index.html")

# api routes
@app.route("/api/v1.0/emission", methods=["GET"])
def getEmission():
    all_data = []
    records = Emission.query.all()

    for record in records:
        entry = {}
        entry["id"] = record.id
        entry["state"] = record.state
        entry["year"] = record.year
        entry["emission_value"] = record.emission_value
        all_data.append(entry)
    
    return jsonify(all_data)


@app.route("/api/v1.0/temperature", methods=["GET"])
def getTemperature():
    all_data = []
    records = Temperature.query.all()

    for record in records:
        entry = {}
        entry["id"] = record.id
        entry["station"] = record.station
        entry["latlng"] = [record.latitude, record.longitude]
        entry["year"] = record.year
        entry["tavg"] = record.tavg
        all_data.append(entry)
    
    return jsonify(all_data)


# start/run server
if __name__ == "__main__":
    app.run(debug=True)
