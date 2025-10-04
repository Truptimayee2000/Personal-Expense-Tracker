import React, { useState, useEffect } from "react";
import "./App.css";

function App() {
  const API_URL = "http://localhost:5000/api";

  const [expenses, setExpenses] = useState([]);
  const [form, setForm] = useState({ amount: "", date: "", note: "", category: "", created_by: "" });
  const [editForm, setEditForm] = useState({ id: "", amount: "", date: "", note: "", category: "" });
  const [filter, setFilter] = useState({ category: "", start_date: "", end_date: "" });
  const [summaryCategory, setSummaryCategory] = useState([]);
  const [summaryMonth, setSummaryMonth] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [summaryType, setSummaryType] = useState("all");
  const [showDropdown, setShowDropdown] = useState(false);

  const fetchExpenses = async () => {
    try {
      const res = await fetch(`${API_URL}/get_expenses`);
      const data = await res.json();
      setExpenses(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSummary = async () => {
    try {
      const resCat = await fetch(`${API_URL}/summary/category`);
      const dataCat = await resCat.json();
      setSummaryCategory(dataCat);

      const resMonth = await fetch(`${API_URL}/summary/month`);
      const dataMonth = await resMonth.json();
      setSummaryMonth(dataMonth);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API_URL}/categories`);
      if (!res.ok) throw new Error("Failed to fetch categories");
      const data = await res.json();
      setCategories(data);
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  useEffect(() => {
    fetchExpenses();
    fetchSummary();
    fetchCategories();
  }, []);

  const addExpense = async (e) => {
    e.preventDefault();
    try {
      await fetch(`${API_URL}/add_expense`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      setForm({ amount: "", date: "", note: "", category: "", created_by: "" });
      fetchExpenses();
      fetchSummary();
      fetchCategories();
      setShowAddModal(false);
    } catch (err) {
      console.error(err);
    }
  };

  const openEditModal = (expense) => {
    setEditForm(expense);
    setShowEditModal(true);
  };

  const updateExpense = async (e) => {
  e.preventDefault();
  try {
    const { id, amount, date, note } = editForm; 
    await fetch(`${API_URL}/update_expense`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, amount, date, note }),
    });
    setShowEditModal(false);
    fetchExpenses();
    fetchSummary();
  } catch (err) {
    console.error(err);
  }
};


  const deleteExpense = async (id) => {
    try {
      await fetch(`${API_URL}/delete_expense`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      fetchExpenses();
      fetchSummary();
      fetchCategories();
    } catch (err) {
      console.error(err);
    }
  };

  const filterExpenses = async () => {
    try {
      let query = [];
      if (filter.category) query.push(`category=${filter.category}`);
      if (filter.start_date) query.push(`start_date=${filter.start_date}`);
      if (filter.end_date) query.push(`end_date=${filter.end_date}`);
      const queryString = query.length ? `?${query.join("&")}` : "";

      const res = await fetch(`${API_URL}/filter_expenses${queryString}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      setExpenses(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSummaryClick = (type) => {
    setSummaryType(type);
    setShowSummaryModal(true);
    setShowDropdown(false);
  };

  return (
    <div className="App">
      <h1>Personal Expense Tracker</h1>
      <div className="container">

        {/* Sidebar Filter */}
        <div className="sidebar">
          <h3>Filter Expenses</h3>
          <label>Category</label>
          <select value={filter.category} onChange={(e) => setFilter({ ...filter, category: e.target.value })}>
            <option value="">All</option>
            {categories.length > 0 ? categories.map((c, i) => <option key={i} value={c}>{c}</option>) : <option disabled>Loading...</option>}
          </select>


          <label>Start Date</label>
          <input type="date" value={filter.start_date} onChange={(e) => setFilter({ ...filter, start_date: e.target.value })} />

          <label>End Date</label>
          <input type="date" value={filter.end_date} onChange={(e) => setFilter({ ...filter, end_date: e.target.value })} />

          <button onClick={filterExpenses}>Filter</button>
          <button onClick={() => { setFilter({ category: "", start_date: "", end_date: "" }); fetchExpenses(); }}>Clear</button>
        </div>

        {/* Main Content */}
        <div className="main">

          {/* Top Buttons */}
          <div className="top-buttons">
            <button className="top-button" onClick={() => setShowAddModal(true)}>Add Expense</button>

            <div style={{ position: "relative", display: "inline-block" }}>
              <button className="top-button" onClick={() => setShowDropdown(!showDropdown)}>View Summary ▼</button>
              {showDropdown && (
                <div className="dropdown-content">
                  <button onClick={() => handleSummaryClick("category")}>By Category</button>
                  <button onClick={() => handleSummaryClick("month")}>By Month</button>
                  <button onClick={() => handleSummaryClick("all")}>All</button>
                </div>
              )}
            </div>
          </div>

          {/* Expenses Table */}
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Amount</th>
                <th>Date</th>
                <th>Note</th>
                <th>Category</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((e) => (
                <tr key={e.id}>
                  <td>{e.id}</td>
                  <td>{e.amount}</td>
                  <td>{e.date}</td>
                  <td>{e.note}</td>
                  <td>{e.category}</td>
                  <td>
                    <button className="edit-button" onClick={() => openEditModal(e)}>Edit</button>
                    <button className="delete-button" onClick={() => deleteExpense(e.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Add Expense Modal */}
          {showAddModal && (
            <div className="modal">
              <div className="modal-content">
                <span className="close" onClick={() => setShowAddModal(false)}>&times;</span>
                <h2>Add Expense</h2>
                <form onSubmit={addExpense}>
                  <input type="number" placeholder="Amount" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required />
                  <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
                  <input type="text" placeholder="Note" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
                  <input type="text" placeholder="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} required />
                  <input type="text" placeholder="Created By" value={form.created_by} onChange={(e) => setForm({ ...form, created_by: e.target.value })} />
                  <button className="submit" type="submit">Add</button>
                </form>
              </div>
            </div>
          )}

          {/* Edit Expense Modal */}
          {showEditModal && (
            <div className="modal">
              <div className="modal-content">
                <span className="close" onClick={() => setShowEditModal(false)}>&times;</span>
                <h2>Edit Expense</h2>
                <form onSubmit={updateExpense}>
                  <input type="number" value={editForm.amount} onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })} required />
                  <input type="date" value={editForm.date} onChange={(e) => setEditForm({ ...editForm, date: e.target.value })} required />
                  <input type="text" value={editForm.note} onChange={(e) => setEditForm({ ...editForm, note: e.target.value })} />
                  <input type="text" value={editForm.category} disabled />
                  <button className="submit" type="submit">Update</button>
                </form>
              </div>
            </div>
          )}

          {/* Summary Modal */}
          {showSummaryModal && (
            <div className="modal">
              <div className="modal-content">
                <span className="close" onClick={() => setShowSummaryModal(false)}>&times;</span>
                {(summaryType === "category" || summaryType === "all") && (
                  <>
                    <h2>Summary by Category</h2>
                    <ul>
                      {summaryCategory.map((s, i) => <li key={i}>{s.category}: {s.total_spent}</li>)}
                    </ul>
                  </>
                )}
                {(summaryType === "month" || summaryType === "all") && (
                  <>
                    <h2>Summary by Month</h2>
                    <ul>
                      {summaryMonth.map((s, i) => <li key={i}>{s.month}: {s.total_spent}</li>)}
                    </ul>
                  </>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default App;
