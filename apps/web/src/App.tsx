import { Button } from '@acme/ui';

function App() {
  return (
    <div className="m-space-400 space-y-space-300">
      {([{ size: 'medium' }, { size: 'small' }] as const).map((props, i) => (
        <div key={i} className="flex flex-wrap gap-space-300">
          <Button variant="primary" {...props}>
            Primary
          </Button>
          <Button variant="neutral" {...props}>
            Neutral
          </Button>
          <Button variant="subtle" {...props}>
            Subtle
          </Button>
          <Button variant="danger-primary" {...props}>
            Danger primary
          </Button>
          <Button variant="danger-subtle" {...props}>
            Danger subtle
          </Button>
          <Button disabled {...props}>
            Disabled
          </Button>
        </div>
      ))}
    </div>
  );
}

export default App;
