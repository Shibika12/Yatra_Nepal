import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, Badge, Spinner } from 'react-bootstrap';
import './AdminPayments.scss';

const AdminPayments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3002/api/payments/admin/payments', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setPayments(response.data.payments);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching payments:', error);
      setError('Failed to load payments');
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      completed: 'success',
      pending: 'warning',
      failed: 'danger'
    };
    return <Badge bg={statusColors[status] || 'secondary'}>{status}</Badge>;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const formatAmount = (amount) => {
    return `NPR ${parseFloat(amount).toLocaleString()}`;
  };

  if (loading) {
    return (
      <div className="admin-payments-loading">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  if (error) {
    return <div className="admin-payments-error">{error}</div>;
  }

  return (
    <div className="admin-payments">
      <div className="admin-payments-header">
        <h2>Payment History</h2>
        <div className="payment-stats">
          <div className="stat-card">
            <h4>Total Payments</h4>
            <p>{payments.length}</p>
          </div>
          <div className="stat-card">
            <h4>Completed Payments</h4>
            <p>{payments.filter(p => p.status === 'completed').length}</p>
          </div>
          <div className="stat-card">
            <h4>Total Revenue</h4>
            <p>
              {formatAmount(
                payments
                  .filter(p => p.status === 'completed')
                  .reduce((sum, p) => sum + parseFloat(p.amount), 0)
              )}
            </p>
          </div>
        </div>
      </div>

      <Table responsive striped hover className="payment-table">
        <thead>
          <tr>
            <th>Transaction ID</th>
            <th>User</th>
            <th>Amount</th>
            <th>Payment Method</th>
            <th>Status</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {payments.map((payment) => (
            <tr key={payment.transaction_id}>
              <td>{payment.transaction_id}</td>
              <td>{payment.user_name}</td>
              <td>{formatAmount(payment.amount)}</td>
              <td>{payment.payment_method}</td>
              <td>{getStatusBadge(payment.status)}</td>
              <td>{formatDate(payment.created_at)}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default AdminPayments; 