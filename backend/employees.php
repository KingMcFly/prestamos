<?php
require 'cors.php';
require 'db.php';

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        $stmt = $pdo->query("SELECT id, nombre as name, rut, area, turno as shift FROM empleados ORDER BY nombre ASC");
        echo json_encode($stmt->fetchAll());
        break;

    case 'POST':
        $rawData = file_get_contents("php://input");
        $data = json_decode($rawData, true);
        
        if (!$data) { 
            http_response_code(400); 
            echo json_encode(["error" => "No data", "received" => $rawData]); 
            exit; 
        }
        
        $sql = "INSERT INTO empleados (id, nombre, rut, area, turno) VALUES (:id, :name, :rut, :area, :shift)
                ON DUPLICATE KEY UPDATE nombre=VALUES(nombre), rut=VALUES(rut), area=VALUES(area), turno=VALUES(turno)";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            ':id' => $data['id'],
            ':name' => $data['name'],
            ':rut' => $data['rut'],
            ':area' => $data['area'] ?? '',
            ':shift' => $data['shift'] ?? 'A'
        ]);
        echo json_encode(["status" => "success"]);
        break;

    case 'DELETE':
        $id = $_GET['id'] ?? null;
        if (!$id) { http_response_code(400); exit; }
        
        $stmt = $pdo->prepare("DELETE FROM empleados WHERE id = ?");
        $stmt->execute([$id]);
        echo json_encode(["status" => "deleted"]);
        break;
}
?>