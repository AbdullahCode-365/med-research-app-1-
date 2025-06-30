import React, { useState } from 'react';

export function Tabs({ defaultValue, children }) {
  const [value, setValue] = useState(defaultValue);
  const context = { value, setValue };
  return <div>{React.Children.map(children, child => React.cloneElement(child, { context }))}</div>;
}

export function TabsList({ children }) {
  return <div className="flex space-x-2 mb-2">{children}</div>;
}

export function TabsTrigger({ value, context, children }) {
  const isActive = context.value === value;
  return (
    <button
      onClick={() => context.setValue(value)}
      className={`px-4 py-2 rounded ${isActive ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
    >
      {children}
    </button>
  );
}

export function TabsContent({ value, context, children }) {
  return context.value === value ? <div>{children}</div> : null;
}
