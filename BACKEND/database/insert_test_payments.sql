-- Insert test payment data
INSERT INTO payments (user_id, transaction_id, amount, payment_method, status, created_at)
VALUES 
(1, 'TEST-001', 1000.00, 'esewa', 'completed', DATE_SUB(NOW(), INTERVAL 1 DAY)),
(1, 'TEST-002', 1500.00, 'esewa', 'completed', DATE_SUB(NOW(), INTERVAL 2 DAY)),
(2, 'TEST-003', 2000.00, 'khalti', 'completed', DATE_SUB(NOW(), INTERVAL 3 DAY)),
(2, 'TEST-004', 2500.00, 'esewa', 'completed', DATE_SUB(NOW(), INTERVAL 4 DAY)),
(1, 'TEST-005', 3000.00, 'khalti', 'completed', DATE_SUB(NOW(), INTERVAL 5 DAY)); 