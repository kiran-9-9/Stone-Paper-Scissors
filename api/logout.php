<?php
require __DIR__ . '/config.php';

session_unset();
session_destroy();

json_response([ 'success' => true ]);


