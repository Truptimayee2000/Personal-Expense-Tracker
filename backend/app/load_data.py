import json
import os
from datetime import datetime
from sqlalchemy.orm import Session
from dbconfig import db
from app.models.expense_model import Expense

JSON_FILE = os.path.join(os.path.dirname(__file__), "..", "data.json")


def load_data():
    if not os.path.exists(JSON_FILE):
        print(f"❌ JSON file not found: {JSON_FILE}")
        return 0

    with open(JSON_FILE, "r", encoding="utf-8") as f:
        try:
            data = json.load(f)
        except json.JSONDecodeError as e:
            print(f"❌ Failed to parse JSON: {e}")
            return 0

    count = 0

    with db.session.no_autoflush:
        for item in data:
            try:
                amount = float(item.get("amount", 0))
                date_str = item.get("date")
                if not date_str:
                    print("⚠️ Skipping record: missing date")
                    continue
                date = datetime.strptime(date_str, "%Y-%m-%d").date()

                note = item.get("note", "")
                category = item.get("category", "Other")
                created_by = item.get("created_by", "system")

                existing = (
                    Expense.query.filter_by(amount=amount, date=date, note=note)
                    .first()
                )
                if existing:
                    continue

                expense = Expense(
                    amount=amount,
                    date=date,
                    note=note,
                    category=category,
                    created_by=created_by,
                    is_active=True,
                    created_on=datetime.now(),
                )

                db.session.add(expense)
                count += 1

            except Exception as e:
                print(f"⚠️ Error processing record: {e}")
                continue

    try:
        db.session.commit()
        print(f"✅ {count} records loaded successfully!")
    except Exception as e:
        db.session.rollback()
        print(f"❌ Error committing data: {e}")

    return count
