import React, { useState, useCallback } from "react"

export default function Todo(){
    const [title, setTitle] = useState("");
    const [description, setDesp] = useState("");
    const [error,setError] = useState("");
    const [msg,setmsg] = useState("");
    const [todos,setTodos] = useState([]);
    const [selectedTodoId, setSelectedTodoId] = useState(null);
    const [editId, setEditId] = useState(null);
    const [editTitle, setEditTitle] = useState("");
    const [editDescription, setEditDescription] = useState("");
    const [confirmDeleteId, setConfirmDeleteId] = useState(null);
    const [showConfirm, setShowConfirm] = useState(false);
    const apiUrl="http://localhost:4000"
    const handlesubmit=()=>{
        //check  inputs
        if (title.trim()!==''&& description.trim()!==''){
            fetch(apiUrl+"/todos",{
                method: "POST",
                headers:{
                    'Content-Type':'application/json'
                },
                body: JSON.stringify({title,description})
            }).then(async (res)=>{
                if(res.ok){
                    const newTodo = await res.json();
                    setTodos([...todos, newTodo]);
                    setmsg("Item Added Successfully")
                    setError(""); // clear error
                    setTitle(""); // clear title input
                    setDesp(""); // clear description input
                }
                else{
                    setError("Unable to Create Todo Item")
                }
            }).catch((err)=>{console.error("Fetch error:",err);
                setError("Failed to connect to backend");
            });
        } else {
            setError("Unable to Create Todo Item");
            setmsg(""); // clear success message
        }
    }



     const handleDelete = useCallback((id) => {
        fetch(`${apiUrl}/todos/${id}`, {
            method: "DELETE"
        })
        .then(res => {
            if (res.ok) {
                setTodos(prevTodos => prevTodos.filter(todo => todo.id !== id));
                setmsg("Item Deleted Successfully");
                setError("");
            } else {
                setError("Unable to Delete Todo Item");
            }
        })
        .catch(err => {
            setError("Failed to connect to backend");
        });
    }, [apiUrl]);

    const handleEdit = (todo) => {
        setEditId(todo._id || todo.id);
        setEditTitle(todo.title);
        setEditDescription(todo.description);
    };

    const handleUpdate = () => {
        if (!editTitle.trim() || !editDescription.trim()) {
            setError("Title and Description cannot be empty");
            return;
        }
        fetch(`${apiUrl}/todos/${editId}`, {
            method: "PUT",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: editTitle, description: editDescription })
        })
        .then(async res => {
            if (res.ok) {
                const updatedTodo = await res.json();
                setTodos(prevTodos => prevTodos.map(todo => (todo._id === editId || todo.id === editId) ? updatedTodo : todo));
                setEditId(null);
                setEditTitle("");
                setEditDescription("");
                setmsg("Item Updated Successfully");
                setError("");
            } else {
                setError("Unable to Update Todo Item");
            }
        })
        .catch(() => setError("Failed to connect to backend"));
    };

    const askDelete = (id) => {
        setConfirmDeleteId(id);
        setShowConfirm(true);
    };

    const confirmDelete = () => {
        setTodos(prevTodos => prevTodos.filter(todo => (todo._id || todo.id) !== confirmDeleteId));
        handleDelete(confirmDeleteId);
        setShowConfirm(false);
        setConfirmDeleteId(null);
    };

    const cancelDelete = () => {
        setShowConfirm(false);
        setConfirmDeleteId(null);
    };

    return (
        <>
            <div className="row p-3 bg-success text-light">
                <h1>TODO</h1>
            </div>
            <div className="row">
                <h3>Add item</h3>
                {msg && <p className="text-success">{msg}</p>}
                <div className="form-group d-flex gap-2">
                    <input placeholder="Title " onChange={(e)=> setTitle(e.target.value)} value={title} className="form-control" type="text" />
                    <input placeholder="Description " onChange={(e)=> setDesp(e.target.value)} value={description} className="form-control" type="text" />
                    <button className="btn btn-dark" onClick={handlesubmit}>Submit</button>
                </div>
                {error &&<p>{error}</p>}
                <h3 className="mt-4">Todo List</h3>
                <ul className="list-group">
                    {todos.map(todo => (
                        <li key={todo._id || todo.id} 
                            className={`list-group-item d-flex justify-content-between align-items-start${selectedTodoId === (todo._id || todo.id) ? ' bg-warning' : ''}`}
                            style={{ background: '#e3f2fd', border: '1px solid #90caf9', borderRadius: '8px', marginBottom: '10px' }}
                            onClick={() => setSelectedTodoId(todo._id || todo.id)}
                            tabIndex={0}
                        >
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 'bold', fontSize: '1.1em', color: '#1565c0' }}>{todo.title}</div>
                                <div style={{ color: '#333', marginTop: '4px' }}>{todo.description}</div>
                            </div>
                            {editId === (todo._id || todo.id) ? (
                                <>
                                    <input
                                        value={editTitle}
                                        onChange={e => setEditTitle(e.target.value)}
                                        className="form-control me-2"
                                        style={{ width: '30%' }}
                                    />
                                    <input
                                        value={editDescription}
                                        onChange={e => setEditDescription(e.target.value)}
                                        className="form-control me-2"
                                        style={{ width: '40%' }}
                                    />
                                    <button className="btn btn-success btn-sm me-2" onClick={handleUpdate}>Save</button>
                                    <button className="btn btn-secondary btn-sm" onClick={() => setEditId(null)}>Cancel</button>
                                </>
                            ) : (
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <button className="btn btn-primary btn-sm me-2" onClick={e => { e.stopPropagation(); handleEdit(todo); }}>Edit</button>
                                    <button className="btn btn-danger btn-sm" onClick={e => { e.stopPropagation(); askDelete(todo._id || todo.id); }}>Delete</button>
                                </div>
                            )}
                        </li>
                    ))}
                </ul>
                {showConfirm && (
                    <div className="modal d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,0.5)' }}>
                        <div className="modal-dialog">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">Confirm Delete</h5>
                                </div>
                                <div className="modal-body">
                                    <p>Are you sure you want to delete?</p>
                                </div>
                                <div className="modal-footer">
                                    <button className="btn btn-danger" onClick={confirmDelete}>Yes</button>
                                    <button className="btn btn-secondary" onClick={cancelDelete}>No</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}