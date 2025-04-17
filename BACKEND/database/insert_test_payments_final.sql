-- Insert test payment data with valid user IDs (29 for Admin and 23 for Tourist)
INSERT INTO payments (user_id, transaction_id, amount, payment_method, status, created_at)
VALUES 
(29, 'TEST-001', 1000.00, 'esewa', 'completed', DATE_SUB(NOW(), INTERVAL 1 DAY)),
(23, 'TEST-002', 1500.00, 'esewa', 'completed', DATE_SUB(NOW(), INTERVAL 2 DAY)),
(29, 'TEST-003', 2000.00, 'khalti', 'completed', DATE_SUB(NOW(), INTERVAL 3 DAY)),
(23, 'TEST-004', 2500.00, 'esewa', 'completed', DATE_SUB(NOW(), INTERVAL 4 DAY)),
(29, 'TEST-005', 3000.00, 'khalti', 'completed', DATE_SUB(NOW(), INTERVAL 5 DAY)); 