const MODE = process.env.REACT_APP_MODE || 'full';

function App() {
    const { Container, Row, Col } = ReactBootstrap;
    return (
        <Container>
            <Row>
                <Col md={{ offset: 3, span: 6 }}>
                    <TodoListCard />
                </Col>
            </Row>
        </Container>
    );
}

function TodoListCard() {
    const [items, setItems] = React.useState(null);

    React.useEffect(() => {
        fetch('/items')
            .then(r => r.json())
            .then(setItems);
    }, []);

    if (items === null) return 'Loading...';

    return (
        <React.Fragment>
            {MODE !== 'readonly' && <AddItemForm />}
            {items.length === 0 && (
                <p className="text-center">No items. Add one above!</p>
            )}
            {items.map(item => (
                <ItemDisplay item={item} key={item.id} />
            ))}
        </React.Fragment>
    );
}

function AddItemForm() {
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
                setSubmitting(false);
                setNewItem('');
            });
    };

    return (
        <Form onSubmit={submitNewItem}>
            <InputGroup className="mb-3">
                <Form.Control
                    value={newItem}
                    onChange={e => setNewItem(e.target.value)}
                    type="text"
                    placeholder="New Item"
                    aria-describedby="basic-addon1"
                />
                <InputGroup.Append>
                    <Button
                        type="submit"
                        variant="success"
                        disabled={!newItem.length || submitting} // Disable button while submitting
                    >
                        {submitting ? <i className="fa fa-spinner fa-spin"></i> : 'Add Item'}
                    </Button>
                </InputGroup.Append>
            </InputGroup>
        </Form>
    );
}

function ItemDisplay({ item }) {
    const { Container, Row, Col } = ReactBootstrap;

    return (
        <Container fluid className={`item ${item.completed && 'completed'}`}>
            <Row>
                {MODE === 'full' && 
                <Col xs={1} className="text-center">
                    <i
                        className={`far ${
                            item.completed ? 'fa-check-square' : 'fa-square'
                        }`}
                    />
                </Col>}
                <Col xs={MODE === 'full' ? 10 : 11} className="name">
                    {item.name}
                </Col>
            </Row>
        </Container>
    );
}

ReactDOM.render(<App />, document.getElementById('root'));
