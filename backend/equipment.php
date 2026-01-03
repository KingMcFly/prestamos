<?php
require 'cors.php';
require 'db.php';

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        $stmt = $pdo->query("SELECT id, serie as serial, tipo as type, marca as brand, modelo as model, valor as value, estado as status, descripcion as description FROM equipos ORDER BY tipo ASC");
        echo json_encode($stmt->fetchAll());
        break;

    case 'POST':
        $data = json_decode(file_get_contents("php://input"), true);
        if (!$data) { http_response_code(400); echo json_encode(["error" => "No data"]); exit; }
        
        // Mapear campos de React a DB
        $sql = "INSERT INTO equipos (id, serie, tipo, marca, modelo, valor, estado, descripcion) 
                VALUES (:id, :serial, :type, :brand, :model, :value, :status, :description)
                ON DUPLICATE KEY UPDATE serie=VALUES(serie), tipo=VALUES(tipo), marca=VALUES(marca), modelo=VALUES(modelo), valor=VALUES(valor), estado=VALUES(estado), descripcion=VALUES(descripcion)";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            ':id' => $data['id'],
            ':serial' => $data['serial'],
            ':type' => $data['type'],
            ':brand' => $data['brand'],
            ':model' => $data['model'],
            ':value' => $data['value'],
            ':status' => $data['status'],
            ':description' => $data['description']
        ]);
        echo json_encode(["status" => "success"]);
        break;

    case 'DELETE':
        $id = $_GET['id'] ?? null;
        if (!$id) { http_response_code(400); exit; }
        
        $stmt = $pdo->prepare("DELETE FROM equipos WHERE id = ?");
        $stmt->execute([$id]);
        echo json_encode(["status" => "deleted"]);
        break;
}
?>