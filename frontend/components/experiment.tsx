'use client';

import { useEffect, useState } from 'react';

type Data = {
  [key: string]: unknown;
}

export default function DataComponent() {
  const [data, setData] = useState<Data | null>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const getData = async () => {
      try {
        const res = await fetch('http://localhost:5000/test');
        
        if (!res.ok) {
          throw new Error('Failed to fetch data');
        }

        const json = await res.json();
        setData(json);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong');
      }
    };

    getData();
  }, []);

  if (error) {
    return (
      <div className="text-red-500">
        {error}
      </div>
    );
  }

  if (!data) {
    return (
      <div>Loading...</div>
    );
  }

  return (
    <div className="p-4">
      <pre className="bg-gray-100 p-4 rounded">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
}