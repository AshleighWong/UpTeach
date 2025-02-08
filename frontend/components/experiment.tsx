'use client';
import { useEffect, useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000';

interface Data {
  message: string;
}

export default function DataComponent() {
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch(`${API_URL}/mahin`)
      .then(res => res.json())
      .then((data: Data) => setMessage(data.message))
      .catch(err => console.error(err));
  }, []);

  return <div>{message}</div>;
}