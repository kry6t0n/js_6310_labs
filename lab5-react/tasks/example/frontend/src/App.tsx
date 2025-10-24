import { useState } from 'react'
import './App.css'
import { Button, Card } from '@my-app/ui-library';
import '@my-app/ui-library/style.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="App">
      <Card title="Добро пожаловать в React + TypeScript + Vite">
        <div className="card-content">
          <p>Это основное приложение, использующее библиотеку компонентов</p>
          
          <div className="counter-section">
            <p>Счетчик: {count}</p>
            <div className="button-group">
              <Button 
                variant="primary" 
                onClick={() => setCount(count + 1)}
              >
                Увеличить
              </Button>
              <Button 
                variant="secondary" 
                onClick={() => setCount(count - 1)}
              >
                Уменьшить
              </Button>
              <Button 
                onClick={() => setCount(0)}
                disabled={count === 0}
              >
                Сбросить
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default App
