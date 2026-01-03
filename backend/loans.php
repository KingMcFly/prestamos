<?php
require 'cors.php';
require 'db.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    // 1. Obtener todos los préstamos y datos del empleado
    $sql = "SELECT 
                p.id, p.fecha as date, p.empleado_id as employeeId, p.observaciones, p.valor_total as totalValue, 
                p.estado as status, p.firma_base64 as signature, p.generado_por as generatedBy,
                p.fecha_devolucion as returnDate, p.recibido_por as receivedBy, p.observaciones_devolucion as returnObservations, p.firma_devolucion as returnSignature,
                e.nombre as emp_name, e.rut as emp_rut, e.area as emp_area, e.turno as emp_shift, e.id as emp_id
            FROM prestamos p
            JOIN empleados e ON p.empleado_id = e.id
            ORDER BY p.created_at DESC";
    
    $stmt = $pdo->query($sql);
    $rawLoans = $stmt->fetchAll();
    
    $loans = [];

    // 2. Para cada préstamo, buscar sus items
    foreach ($rawLoans as $row) {
        // Buscar items
        $itemSql = "SELECT 
                        eq.id, eq.serie as serial, eq.tipo as type, eq.marca as brand, eq.modelo as model, eq.valor as value, eq.estado as status, eq.descripcion as description
                    FROM prestamos_items pi
                    JOIN equipos eq ON pi.equipo_id = eq.id
                    WHERE pi.prestamo_id = ?";
        $itemStmt = $pdo->prepare($itemSql);
        $itemStmt->execute([$row['id']]);
        $equipments = $itemStmt->fetchAll();

        $items = [];
        foreach($equipments as $eq) {
            $items[] = [
                'equipmentId' => $eq['id'],
                'quantity' => 1,
                'equipmentSnapshot' => $eq
            ];
        }

        // Construir objeto Loan
        $loans[] = [
            'id' => $row['id'],
            'date' => $row['date'],
            'employeeId' => $row['employeeId'],
            'employeeSnapshot' => [
                'id' => $row['emp_id'],
                'name' => $row['emp_name'],
                'rut' => $row['emp_rut'],
                'area' => $row['emp_area'],
                'shift' => $row['emp_shift']
            ],
            'items' => $items,
            'observations' => $row['observaciones'],
            'totalValue' => (int)$row['totalValue'],
            'status' => $row['status'],
            'signature' => $row['signature'],
            'generatedBy' => $row['generatedBy'],
            'returnDate' => $row['returnDate'],
            'receivedBy' => $row['receivedBy'],
            'returnObservations' => $row['returnObservations'],
            'returnSignature' => $row['returnSignature']
        ];
    }
    
    echo json_encode($loans);

} elseif ($method === 'POST') {
    // CREAR NUEVO PRÉSTAMO
    $data = json_decode(file_get_contents("php://input"), true);
    
    try {
        $pdo->beginTransaction();

        // 1. Insertar Préstamo
        $sql = "INSERT INTO prestamos (id, fecha, empleado_id, observaciones, valor_total, estado, firma_base64, generado_por)
                VALUES (:id, :date, :empId, :obs, :total, 'activo', :sig, :gen)";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            ':id' => $data['id'],
            ':date' => $data['date'],
            ':empId' => $data['employeeId'],
            ':obs' => $data['observations'],
            ':total' => $data['totalValue'],
            ':sig' => $data['signature'] ?? null,
            ':gen' => $data['generatedBy']
        ]);

        // 2. Insertar Items y Actualizar Estado de Equipos
        $sqlItem = "INSERT INTO prestamos_items (prestamo_id, equipo_id) VALUES (?, ?)";
        $stmtItem = $pdo->prepare($sqlItem);
        
        $sqlUpdateEq = "UPDATE equipos SET estado = 'prestado' WHERE id = ?";
        $stmtUpdateEq = $pdo->prepare($sqlUpdateEq);

        foreach ($data['items'] as $item) {
            $eqId = $item['equipmentId'];
            
            // Insertar relación
            $stmtItem->execute([$data['id'], $eqId]);
            
            // Actualizar estado equipo
            $stmtUpdateEq->execute([$eqId]);
        }

        $pdo->commit();
        echo json_encode(["status" => "success"]);

    } catch (Exception $e) {
        $pdo->rollBack();
        http_response_code(500);
        echo json_encode(["error" => $e->getMessage()]);
    }

} elseif ($method === 'PUT') {
    // DEVOLUCIÓN DE PRÉSTAMO
    $data = json_decode(file_get_contents("php://input"), true);

    try {
        $pdo->beginTransaction();

        // 1. Actualizar Préstamo
        $sql = "UPDATE prestamos SET 
                estado = 'devuelto',
                fecha_devolucion = :rDate,
                recibido_por = :rBy,
                observaciones_devolucion = :rObs,
                firma_devolucion = :rSig
                WHERE id = :id";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            ':rDate' => $data['returnDate'],
            ':rBy' => $data['receivedBy'],
            ':rObs' => $data['returnObservations'],
            ':rSig' => $data['returnSignature'] ?? null,
            ':id' => $data['id']
        ]);

        // 2. Buscar items de este préstamo para liberarlos
        $stmtItems = $pdo->prepare("SELECT equipo_id FROM prestamos_items WHERE prestamo_id = ?");
        $stmtItems->execute([$data['id']]);
        $items = $stmtItems->fetchAll(PDO::FETCH_COLUMN);

        // 3. Actualizar equipos a 'disponible'
        $stmtEq = $pdo->prepare("UPDATE equipos SET estado = 'disponible' WHERE id = ?");
        foreach ($items as $eqId) {
            $stmtEq->execute([$eqId]);
        }

        $pdo->commit();
        echo json_encode(["status" => "success"]);

    } catch (Exception $e) {
        $pdo->rollBack();
        http_response_code(500);
        echo json_encode(["error" => $e->getMessage()]);
    }
}
?>