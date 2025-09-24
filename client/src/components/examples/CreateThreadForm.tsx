import CreateThreadForm from '../CreateThreadForm';

export default function CreateThreadFormExample() {
  return (
    <div className="p-4">
      <CreateThreadForm 
        onSubmit={(thread) => console.log('Thread submitted:', thread)}
        onCancel={() => console.log('Thread creation cancelled')}
      />
    </div>
  );
}