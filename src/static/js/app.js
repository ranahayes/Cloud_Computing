function App() {
    const { Container, Row, Col } = ReactBootstrap;
    return (
        <Container className="mt-5">
            <Row>
                <Col md={{ offset: 3, span: 6 }}>
                    <div className="card p-3 shadow" style={{ borderRadius: "15px", background: "linear-gradient(135deg, #81FBB8 0%, #28C76F 100%)" }}>
                        <h2 className="text-center text-white">Todo List</h2>
                        <TodoListCard />
                    </div>
                </Col>
            </Row>
        </Container>
    );
}

function TodoListCard() {
    const [items, setItems] = React.useState(['Hello']); // Initialize with an empty array

    React.useEffect(() => {
        fetch('/items')
            .then(r => r.json())
            .then(data => setItems(data || [])); // Ensure data is an array or fallback to empty array
    }, []);

    const onNewItem = React.useCallback(
        newItem => {
            if(newItem && newItem.id && newItem.name) { // Ensure newItem has necessary fields
                setItems(prevItems => [...prevItems, newItem]);
            }
        },
        [],
    );

    const onItemUpdate = React.useCallback(
        item => {
            const index = items.findIndex(i => i.id === item.id);
            setItems([
                ...items.slice(0, index),
                item,
                ...items.slice(index + 1),
            ]);
        },
        [items],
    );

    const onItemRemoval = React.useCallback(
        item => {
            const index = items.findIndex(i => i.id === item.id);
            setItems([...items.slice(0, index), ...items.slice(index + 1)]);
        },
        [items],
    );

    if (items.length === 0) return 'Loading...';

    return (
        <React.Fragment>
            <AddItemForm onNewItem={onNewItem} />
            {items.length === 0 && (
                <p className="text-center text-white-50">Nothing to do? Add a task!</p>
            )}
            {items.map(item => (
                <ItemDisplay
                    item={item}
                    key={item.id}
                    onItemUpdate={onItemUpdate}
                    onItemRemoval={onItemRemoval}
                />
            ))}
        </React.Fragment>
    );
}

function AddItemForm({ onNewItem }) {
    const { Form, InputGroup, Button } = ReactBootstrap;

    const [newItem, setNewItem] = React.useState('');
    const [submitting, setSubmitting] = React.useState(false);

    const submitNewItem = e => {
        e.preventDefault();
        setSubmitting(true);
        fetch('/items', {
            method: 'POST',
            body: JSON.stringify({ name: newItem }),
            headers: { 'Content-Type': 'application/json' },
        })
            .then(r => r.json())
            .then(item => {
                onNewItem(item);
                setSubmitting(false);
                setNewItem('');
            });
    };

    return (
        <Form onSubmit={submitNewItem}>
            <InputGroup className="mb-3">
                <Form.Control
                    // ...
                    className="rounded-pill"
                    placeholder="What needs to be done?"
                    // ...
                />
                <InputGroup.Append>
                    <Button
                        type="submit"
                        variant="dark"
                        className={"rounded-pill " + (submitting ? 'disabled' : '')}
                        // ...
                    >
                        {submitting ? <i className="fa fa-spinner fa-spin"></i> : 'Add Task'}
                    </Button>
                </InputGroup.Append>
            </InputGroup>
        </Form>
    );
}

function ItemDisplay({ item, onItemUpdate, onItemRemoval }) {
    const { Container, Row, Col, Button } = ReactBootstrap;

    const toggleCompletion = () => {
        fetch(`/items/${item.id}`, {
            method: 'PUT',
            body: JSON.stringify({
                name: item.name,
                completed: !item.completed,
            }),
            headers: { 'Content-Type': 'application/json' },
        })
            .then(r => r.json())
            .then(onItemUpdate);
    };

    const removeItem = () => {
        fetch(`/items/${item.id}`, { method: 'DELETE' }).then(() =>
            onItemRemoval(item),
        );
    };

    return (
        <Container fluid className={`item p-2 mb-2 rounded shadow-sm ${item.completed && 'bg-success text-white'}`}>
            <Row>
                <Col xs={1} className="text-center">
                    <Button
                        variant={item.completed ? "outline-light" : "outline-success"}
                        className="p-1"
                        onClick={toggleCompletion}
                        aria-label={item.completed ? 'Mark as incomplete' : 'Mark as complete'}
                    >
                        <i className={`fa ${item.completed ? 'fa-check-circle' : 'fa-circle'}`} />
                    </Button>
                </Col>
                <Col xs={10} className="align-self-center">
                    {item.name}
                </Col>
                <Col xs={1} className="text-center">
                    <Button
                        variant="outline-danger"
                        className="p-1"
                        onClick={removeItem}
                        aria-label="Remove Item"
                    >
                        <i className="fa fa-trash" />
                    </Button>
                </Col>
            </Row>
        </Container>
    );
}
ReactDOM.render(<App />, document.getElementById('root'));

