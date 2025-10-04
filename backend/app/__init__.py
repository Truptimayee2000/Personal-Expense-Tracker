from flask import Flask
from flask_cors import CORS
app = Flask(__name__)
CORS(app)

from app.load_data import load_data
from app.route import home_route
from app.models.expense_model import init_db

with app.app_context():
    init_db(app)
    load_data() 
