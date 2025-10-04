from flask import request, jsonify
from sqlalchemy import func
from app import app
from dbconfig import db
from datetime import datetime
from app.models.expense_model import Expense

# ✅ Add Expense
@app.route('/api/add_expense', methods=['POST'])
def add_expense():
    try:
        data = request.json
        amount = data.get('amount')
        date = data.get('date')
        note = data.get('note')
        category = data.get('category', 'Other')
        created_by = data.get('created_by', 'system')  

        if not amount or not date:
            return jsonify({"error": "Amount and Date are required"})

        expense = Expense(
            amount=float(amount),
            date=datetime.strptime(date, '%Y-%m-%d').date(),
            note=note,
            category=category,
            created_by=created_by
        )

        db.session.add(expense)
        db.session.commit()

        return jsonify({"message": "Expense added successfully"})
    

    except Exception as e:
        return jsonify({"error": str(e)})
        

# ✅ View all expenses
@app.route('/api/get_expenses', methods=['GET'])
def get_expenses():
    try:
        expenses = Expense.query.all()

        result = []
        for e in expenses:
            result.append({
                "id": e.id,
                "amount": e.amount,
                "date": e.date.strftime('%Y-%m-%d'),
                "note": e.note,
                "category": e.category
            })

        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)})


# ✅ Update expense
@app.route('/api/update_expense', methods=['POST'])
def update_expense():
    try:
        data = request.json
        expense_id = data.get('id')

        if not expense_id:
            return jsonify({"error": "Expense ID is required"})

        expense = Expense.query.get(expense_id)
        if not expense:
            return jsonify({"error": "Expense not found"})

        if "amount" in data and data["amount"] is not None:
            expense.amount = float(data["amount"])
        if "date" in data and data["date"]:
            expense.date = datetime.strptime(data["date"], '%Y-%m-%d').date()
        if "note" in data:
            expense.note = data["note"]
        if "category" in data:
            expense.category = data["category"]

        db.session.commit()
        return jsonify({"message": "Expense updated successfully"})

    except Exception as e:
        return jsonify({"error": str(e)})



# ✅ Delete expense
@app.route('/api/delete_expense', methods=['POST'])
def delete_expense():
    try:
        data = request.json
        expense_id = data.get('id')

        if not expense_id:
            return jsonify({"error": "Expense ID is required"})

        try:
            expense_id = int(expense_id)
        except ValueError:
            return jsonify({"error": "Expense ID must be an integer"})

        expense = Expense.query.get(expense_id)
        if not expense:
            return jsonify({"error": "Expense not found"})

        db.session.delete(expense)
        db.session.commit()
        return jsonify({"message": "Expense deleted successfully"})

    except Exception as e:
        return jsonify({"error": str(e)})

# filter
@app.route('/api/filter_expenses', methods=['GET'])
def filter_expenses():
    try:
        category = request.args.get('category')
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')

        query = Expense.query
        if category:
            query = query.filter(Expense.category == category)
        if start_date:
            query = query.filter(Expense.date >= datetime.strptime(start_date, '%Y-%m-%d').date())
        if end_date:
            query = query.filter(Expense.date <= datetime.strptime(end_date, '%Y-%m-%d').date())

        expenses = query.distinct().all()

        result = [{
            "id": e.id,
            "amount": e.amount,
            "date": e.date.strftime('%Y-%m-%d'),
            "note": e.note,
            "category": e.category
        } for e in expenses]

        return jsonify(result)

    except Exception as e:
        return jsonify({"error": str(e)})


# summary report by catagory
@app.route('/api/summary/category', methods=['GET'])
def summary_by_category():
    try:
        summary = db.session.query(
            Expense.category,
            func.sum(Expense.amount).label("total_spent")
        ).group_by(Expense.category).all()

        result = [{"category": s.category, "total_spent": float(s.total_spent)} for s in summary]
        return jsonify(result)

    except Exception as e:
        return jsonify({"error": str(e)})
    

# summary report by month
@app.route('/api/summary/month', methods=['GET'])
def summary_by_month():
    try:
        summary = db.session.query(
            func.date_trunc('month', Expense.date).label('month'),
            func.sum(Expense.amount).label('total_spent')
        ).group_by(func.date_trunc('month', Expense.date)).order_by(func.date_trunc('month', Expense.date)).all()

        result = [{"month": s.month.strftime('%Y-%m'), "total_spent": float(s.total_spent)} for s in summary]
        return jsonify(result)

    except Exception as e:
        return jsonify({"error": str(e)})


@app.route('/api/categories', methods=['GET'])
def get_categories():
    try:
        categories = db.session.query(Expense.category).distinct().all()
        category_list = [c[0] for c in categories]
        return jsonify(category_list)
    except Exception as e:
        return jsonify({"error": str(e)})
