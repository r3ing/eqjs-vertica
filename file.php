<html>
    <head>
        <style type="text/css">
            .success, .error, .validation {
                border: 1px solid;
                margin: 10px 0px;
                padding:5px 10px 5px 10px;
                background-repeat: no-repeat;
                background-position: 10px center;
                font-family:Arial, Helvetica, sans-serif;
                font-size:13px;
                text-align:left;
                width:auto;
            }
            .success {
                color: #4F8A10;
                background-color: #DFF2BF;
                background-image:url('imagenes/correcto.JPG');
            }
            .error {
                color: #D8000C;
                background-color: #FFBABA;
                background-image: url('imagenes/error.jpg');
            }
        </style>
    </head>
    <body>
        <?php
        $archivo = (isset($_FILES['queryFile'])) ? $_FILES['queryFile'] : null;
        if ($archivo) {
            $extension = pathinfo($archivo['name'], PATHINFO_EXTENSION);
            $extension = strtolower($extension);
            $extension_correcta = ($extension == 'json');
            if ($extension_correcta) {
                //$ruta_destino_archivo = "{$archivo['name']}";
                $ruta_destino_archivo = "LastQuery.json";
                $archivo_ok = move_uploaded_file($archivo['tmp_name'], $ruta_destino_archivo);

                echo '<div class="success"><b>Archivo cargado con éxito</b></div>';
                ?>
                <script type="text/javascript">
                    function redireccionarPagina() {
                        window.location = "upload.html";
                    }
                    setTimeout("redireccionarPagina()", 2000);
                </script>
                <?php
            }
            else {
                echo '<div class="error"><b>Extensión Inválida</b></div>';
                ?>
                <script type="text/javascript">
                    function redireccionarPagina() {
                        window.location = "upload.html";
                    }
                    setTimeout("redireccionarPagina()", 2000);
                </script>
                <?php
            }
        }
        ?>
    </body>
</html>
