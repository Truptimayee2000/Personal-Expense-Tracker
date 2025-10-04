from dbconfig import db
from datetime import datetime

class Expense(db.Model):
    __tablename__ = 'expenses'

    id = db.Column(db.Integer, primary_key=True)
    amount = db.Column(db.Float, nullable=False)
    date = db.Column(db.Date, nullable=False)
    note = db.Column(db.String(200))
    category = db.Column(db.String(50))
    created_on = db.Column(db.DateTime, default=datetime.now())
    created_by = db.Column(db.String(100))
    updated_on = db.Column(db.DateTime, onupdate=datetime.now())
    updated_by = db.Column(db.String(100))
    is_active = db.Column(db.Boolean, default=True)

    def to_dict(self):
        return {
            "id": self.id,
            "amount": self.amount,
            "date": self.date.strftime('%Y-%m-%d'),
            "note": self.note,
            "category": self.category,
            "created_on": self.created_on.strftime('%Y-%m-%d %H:%M:%S') if self.created_on else None,
            "created_by": self.created_by,
            "updated_on": self.updated_on.strftime('%Y-%m-%d %H:%M:%S') if self.updated_on else None,
            "updated_by": self.updated_by,
            "is_active": self.is_active
        }

def init_db(app):
    with app.app_context():
        db.create_all()
        print("✅ Tables created successfully!")