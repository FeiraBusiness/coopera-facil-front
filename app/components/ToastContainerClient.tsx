'use client';

import { ToastContainer } from 'react-toastify';

export default function ToastContainerClient() {
  return <ToastContainer position="top-right" autoClose={5000} newestOnTop closeOnClick pauseOnHover />;
}
