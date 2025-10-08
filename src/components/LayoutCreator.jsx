import React, { useState } from 'react';

const LayoutCreator = ({ onSave, onCancel }) => {
    const [layoutName, setLayoutName] = useState('');
    const [rows, setRows] = useState(8);
    const [cols, setCols] = useState(10);
    const [seatTypes, setSeatTypes] = useState([{ id: 1, typeName: 'Standard', price: '150' }]);
    const [rowAssignments, setRowAssignments] = useState({});

    const addSeatType = () => {
        const newId = seatTypes.length > 0 ? Math.max(...seatTypes.map(t => t.id)) + 1 : 1;
        setSeatTypes([...seatTypes, { id: newId, typeName: '', price: '' }]);
    };

    const updateSeatType = (id, field, value) => {
        setSeatTypes(seatTypes.map(type => type.id === id ? { ...type, [field]: value } : type));
    };
    
    const removeSeatType = (id) => {
        setSeatTypes(seatTypes.filter(type => type.id !== id));
        // Also remove any row assignments using this type
        const newAssignments = { ...rowAssignments };
        Object.keys(newAssignments).forEach(rowIndex => {
            if (newAssignments[rowIndex] === id) {
                delete newAssignments[rowIndex];
            }
        });
        setRowAssignments(newAssignments);
    };

    const handleRowAssignment = (rowIndex, typeId) => {
        setRowAssignments({ ...rowAssignments, [rowIndex]: parseInt(typeId) });
    };

    const handleSaveLayout = () => {
        // Validate
        if (!layoutName || seatTypes.some(t => !t.typeName || !t.price)) {
            alert('Please fill in layout name and all seat type details.');
            return;
        }

        // Format data for saving
        const formattedSeats = seatTypes.map(type => {
            const assignedRows = Object.keys(rowAssignments)
                .filter(rowIndex => rowAssignments[rowIndex] === type.id)
                .map(Number);
            return {
                ...type,
                price: parseInt(type.price),
                rows: assignedRows,
            };
        }).filter(type => type.rows.length > 0);

        const newLayout = {
            id: `layout_${Date.now()}`,
            name: layoutName,
            rows: Number(rows),
            cols: Number(cols),
            seats: formattedSeats,
        };

        onSave(newLayout);
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-lg shadow-2xl w-full max-w-4xl text-white max-h-[90vh] flex flex-col">
                <div className="p-4 border-b border-gray-700">
                    <h2 className="text-2xl font-bold text-red-500">Create Seating Layout</h2>
                </div>
                <div className="p-6 space-y-6 overflow-y-auto">
                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                         <input type="text" placeholder="Layout Name (e.g., 'IMAX Hall')" value={layoutName} onChange={e => setLayoutName(e.target.value)} className="p-2 bg-gray-700 rounded-md" />
                         <input type="number" placeholder="Rows" value={rows} onChange={e => setRows(e.target.value)} className="p-2 bg-gray-700 rounded-md" />
                         <input type="number" placeholder="Seats per Row" value={cols} onChange={e => setCols(e.target.value)} className="p-2 bg-gray-700 rounded-md" />
                    </div>
                    {/* Seat Types */}
                    <div>
                        <h3 className="font-bold mb-2">Seat Types</h3>
                        <div className="space-y-2">
                            {seatTypes.map(type => (
                                <div key={type.id} className="flex items-center gap-2 bg-gray-700 p-2 rounded-md">
                                    <input type="text" placeholder="Type Name (e.g. Premium)" value={type.typeName} onChange={e => updateSeatType(type.id, 'typeName', e.target.value)} className="p-2 w-full bg-gray-600 rounded-md" />
                                    <input type="number" placeholder="Price" value={type.price} onChange={e => updateSeatType(type.id, 'price', e.target.value)} className="p-2 w-1/3 bg-gray-600 rounded-md" />
                                    <button onClick={() => removeSeatType(type.id)} className="text-red-500 hover:text-red-400 p-2">&times;</button>
                                </div>
                            ))}
                        </div>
                        <button onClick={addSeatType} className="mt-2 text-sm bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md">+ Add Seat Type</button>
                    </div>

                    {/* Row Assignments */}
                    <div>
                        <h3 className="font-bold mb-2">Assign Seat Types to Rows</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {Array.from({ length: rows }).map((_, i) => (
                            <div key={i} className="flex items-center gap-2">
                                <label className="w-1/3">Row {i + 1}</label>
                                <select value={rowAssignments[i] || ''} onChange={e => handleRowAssignment(i, e.target.value)} className="w-2/3 p-2 bg-gray-700 rounded-md">
                                    <option value="">-- Select --</option>
                                    {seatTypes.map(type => <option key={type.id} value={type.id}>{type.typeName}</option>)}
                                </select>
                            </div>
                        ))}
                        </div>
                    </div>
                </div>
                 <div className="p-4 border-t border-gray-700 flex justify-end space-x-4">
                    <button onClick={onCancel} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded-md">Cancel</button>
                    <button onClick={handleSaveLayout} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-md">Save Layout</button>
                </div>
            </div>
        </div>
    );
};

export default LayoutCreator;
