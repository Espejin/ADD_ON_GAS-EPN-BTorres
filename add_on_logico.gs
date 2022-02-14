// ----------------------------------------------------------------------------------------------------------------------
// -------------------- FUNCIONES DE CREACION DE ADD - ON DENTRO DE SPREADSHEETS ----------------------------------------
// ----------------------------------------------------------------------------------------------------------------------

// Permite pasar datos entre el servidor y el cliente.
function doGet() {
var template = HtmlService.createTemplateFromFile('barra_add_on');
return template.evaluate().setSandboxMode(HtmlService.SandboxMode.IFRAME);
}

//Permite crear el menu del add-on en la barra superior
function onOpen(e) {
      SpreadsheetApp.getUi().createAddonMenu()
          .addItem('Ejecutar Add-On', 'mostrarComplemento')
          .addToUi();
      mostrarComplemento()    
}

//Agrega las sentencias de la funcion on Open
function onInstall(e) {
      onOpen(e);
}

//Esta funcion llama y ejecuta la vista HTML referenciada
function mostrarComplemento() {
      var ui = HtmlService.createTemplateFromFile('barra_add_on')
          .evaluate()
          .setTitle('Add-On de interpretación gráfica')
          .setSandboxMode(HtmlService.SandboxMode.IFRAME);
      
      SpreadsheetApp.getUi().showSidebar(ui);
}

//Permite extraer codigo de archivos externos al principal .gs y tomar su funcionalidad
function extraer_archivo(filename) {
  return HtmlService.createTemplateFromFile(filename).getRawContent();
}

// ----------------------------------------------------------------------------------------------------------------------
// -------------------- FUNCIONES DE CARACTER FUNCIONAL DEL ADD - ON ----------------------------------------------------
// ----------------------------------------------------------------------------------------------------------------------


//Esta funcion permite seleccionar un rango, verificando si el valor ingresado se coloco en notacion A1
function verificar_rango(rangazo){

    let mi_app = SpreadsheetApp;
    let hoja_actual = mi_app.getActiveSpreadsheet().getActiveSheet();
    let celdas = [];

    if(!rangazo.match(/\S/)){
        try{
            celdas = hoja_actual.getActiveRange().getValues();
            return JSON.stringify("CORRECTO");
        }
        catch(err){
            return JSON.stringify("ERROR_SELECT");
        }
    } else{
        try{
            let rango = hoja_actual.getRange(rangazo);
            rango.activate();
            celdas = hoja_actual.getRange(rangazo).getValues();
            return JSON.stringify("CORRECTO");
        }
        catch(err){
            return JSON.stringify("ERROR_INSERT");
        }
    }

}


//Esta funcion devuelve una matriz de datos, en funcion de un rango de celdas
function extraer_valores(){
    
      var mi_app = SpreadsheetApp;
      var hoja_actual = mi_app.getActiveSpreadsheet().getActiveSheet();
      var celdas = hoja_actual.getActiveRange().getValues();

      return celdas;
}


//Funcion que permite insertar un gráfico en la hoja de cálculo, se aceptan 4 tipos de gráficos
//de línea, barras, pastel y dispersión
function graficador(tipo){

      let mi_app = SpreadsheetApp;
      let hoja_actual = mi_app.getActiveSpreadsheet().getActiveSheet();
      var rango = hoja_actual.getActiveRange();

      verificar_chart();

      let grafico_insertar = hoja_actual.newChart();

      if(tipo == "G1"){

          grafico_insertar.addRange(rango)
              .setChartType(Charts.ChartType.LINE)
              .setOption('title','Gráfico de Línea (ADD-ON IG)')
              .setOption('interpolateNulls',true)
              .setPosition(calcular_posicion_grafico()[0], calcular_posicion_grafico()[1], 0, 0); 
          hoja_actual.insertChart(grafico_insertar.build());

      }
      else if(tipo == "G2"){

          grafico_insertar.addRange(rango)
            .setChartType(Charts.ChartType.BAR)
            .setOption('title','Gráfico de Barras (ADD-ON IG)')
            .setPosition(calcular_posicion_grafico()[0], calcular_posicion_grafico()[1],0,0);
          hoja_actual.insertChart(grafico_insertar.build());

      }
      else if(tipo == "G3"){

          grafico_insertar.addRange(rango)
            .setChartType(Charts.ChartType.PIE)
            .setOption('title','Gráfico de Pastel (ADD-ON IG)')
            .setPosition(calcular_posicion_grafico()[0], calcular_posicion_grafico()[1],0,0);
          hoja_actual.insertChart(grafico_insertar.build());

      }
      else if(tipo == "G4"){

          grafico_insertar.addRange(rango)
            .setChartType(Charts.ChartType.SCATTER)
            .setOption('title','Gráfico de Dispersión (ADD-ON IG)')
            .setPosition(calcular_posicion_grafico()[0], calcular_posicion_grafico()[1],0,0);
          hoja_actual.insertChart(grafico_insertar.build());

          }
}


//Verifica si existe un gráfico insertado por el add-on, en caso de hacerlo lo elimina e inserta un nuevo gráfico.
function verificar_chart() {
  let mi_app = SpreadsheetApp;
  let hoja = mi_app.getActiveSpreadsheet().getActiveSheet();
  let charts = hoja.getCharts();
  for (var i = 0; i < charts.length; ++i) {
    let options = charts[i].getOptions();
    Logger.log("Opciones de graficos _" + options);
    if (options.get('title') === 'Gráfico de Línea (ADD-ON IG)' || options.get('title') === 'Gráfico de Barras (ADD-ON IG)' || options.get('title') === 'Gráfico de Pastel (ADD-ON IG)'|| options.get('title') === 'Gráfico de Dispersión (ADD-ON IG)') {
      hoja.removeChart(charts[i])
      return i;//charts[i];
    }
  }
  return null;
}

//Permite colocar el gráfico con una separación de dos celdas a la derecha y a la misma altura que el rango de datos seleccionado
function calcular_posicion_grafico(){

    let mi_app = SpreadsheetApp;
    let hoja_actual = mi_app.getActiveSpreadsheet().getActiveSheet();
    let columna = hoja_actual.getActiveRange().getLastColumn() + 2;
    let fila = (hoja_actual.getActiveRange().getLastRow() + 1) - (hoja_actual.getActiveRange().getNumRows());

    return [fila,columna];
}


// ----------------------------------------------------------------------------------------------------------------------
// FUNCIONES GRAFICO DE LINEAS Y DISPERSION

// --------------------------------------------------------------------------------------------------------------------
//Escalado desde 293.7 [Hz], D (RE) en 4ta escala, hasta 1976 [Hz], B (SI) en 6ta escala, se pasa la 4ta escala semi-
//completa, 5ta y 6ta escala completa, se ascendera de 10 en 10 [Hz] de modo que el cambio sea notorio, pero no molesto.
function escalador_frecuencias(tiempo_osc,tipo_vacio,grafico){

  var aux = 293.7; 
  var frecuencias = [];

    for (var i = 0; i < Math.floor((1200/10)-(293.7/10)) + 1; i++) {
        frecuencias[i] = aux;
        aux = aux + 10;

        if( frecuencias[i] + 10 > 1200 ){
            frecuencias[i+1] = 1200
        }
    }
    
    var datos = extraer_valores();
    datos = retornar_varias_columnas(datos);
    datos = identificar_vacios_especial(datos,tipo_vacio);

    var puntos_frec = [];
    var puntos_frec_it = [];

    var max_min_d = max_min_mat(datos);
    var len_frec = frecuencias.length;

    var distancia = distancia_puntos(datos);
    var canales = eje_espacial(extraer_columnas(datos,"tiempo"));

    //saltarse primera columna porque contiene la escala en el eje x del grafico lineal.
    if(max_min_d[1] < 0){

        for(var c = 1; c < (datos[0].length) ; c++){
            for(var f = 0; f < datos.length; f++){
                if(datos[f][c] == "NO" && tipo_vacio == "O1"){
                  puntos_frec_it[f] = 2;
                }
                else{
                    datos[f][c] = (Math.round(((datos[f][c] + (max_min_d[1]*(-1)))/(max_min_d[0] + (max_min_d[1]*(-1))))*(len_frec-1)));
                    puntos_frec_it[f] = frecuencias[datos[f][c]];
                    datos[f][c] = frecuencias[datos[f][c]];
                }
            }
                puntos_frec.push(puntos_frec_it);
                puntos_frec_it = [];
        }

    }else{

        for(var c = 1; c < (datos[0].length) ; c++){
            for(var f = 0; f < datos.length; f++){
                if(datos[f][c] == "NO" && tipo_vacio == "O1"){
                    puntos_frec_it[f] = 2;
                }
                else{
                    datos[f][c] = (Math.round(((datos[f][c])/(max_min_d[0]))*(len_frec-1)));
                    puntos_frec_it[f] = frecuencias[datos[f][c]];
                    datos[f][c] = frecuencias[datos[f][c]];
                }
            }
                puntos_frec.push(puntos_frec_it);
                puntos_frec_it = [];
        }
    }

    var tiempo_f = escalador_tiempo(tiempo_osc,distancia);
    if(grafico == "linea"){
        graficador("G1");
    } else if(grafico == "dispersion"){
        graficador("G4");
    }
  
    return [puntos_frec,tiempo_f,canales,[]];

}

//Permite tomar el tiempo de sonificacion y devolverlo en segmentos de tiempo mas pequeños segun sea necesario
function escalador_tiempo(tiempo_esc,dist){
    var max_d = 0;
    var tiempo_it = [];
    var tiemp_final = [];
    var count = 0;

    for(var i = 0; i < dist.length; i++){
        max_d = dist[i].reduce((a, b) => a + b, 0);
        for(var j = 0; j < dist[i].length; j++){
            (dist[i])[j] = ((dist[i])[j]/max_d)*tiempo_esc;
            tiempo_it[count] = (dist[i])[j];
            count++;
        }
        tiemp_final.push(tiempo_it);
        tiempo_it = [];
        count = 0;
    }
    
    return tiemp_final;

}


// ----------------------------------------------------------------------------------------------------------------------
// FUNCIONES GRAFICO DE BARRAS

//Permite asociar cada barra con una frecuencia puntual, atada a una nota musical en el rango definido.
function escalador_frecuencias_barras(tiempo_esc,tipo_vacio){

    let datos_barras = extraer_valores();
    reemplazar_por_promedio(datos_barras)
    datos_barras = retornar_varias_columnas(datos_barras);
    let frec_ref = escala_musica();
    let frec_baras_aux = [];
    let frec_baras = [];
    let sumas = [];
    let cabecera = [];
    let count_fila = [];
    
    //Colocando frecuencia a las barras;
    for(var f = 0; f < datos_barras.length; f++){
        cabecera[f] = datos_barras[f][0];
        sumas[f] = 0;
        count_fila[f] = 0;
        for(var c = 1; c < datos_barras[f].length; c++){
            frec_baras_aux[c-1] = frec_ref[f];

            if(typeof datos_barras[f][c] == 'number'){
                sumas[f] = sumas[f] +  datos_barras[f][c];
                count_fila[f] = count_fila[f]+1;
            }
        }
        frec_baras.push(frec_baras_aux);
        frec_baras_aux = [];
    }

    let max_min_bar = max_min_mat(datos_barras);

    if(Math.abs(max_min_bar[1]) > max_min_bar[0]){
        max_min_bar[0] = Math.abs(max_min_bar[1]);
    }

    let tiem_bar_aux = [];
    let tiem_bar = [];

    for(var f = 0; f < datos_barras.length; f++){
        for(var c = 1; c < datos_barras[f].length; c++){

            if(tipo_vacio == "O1" && (typeof datos_barras[f][c] != 'number')){
                tiem_bar_aux[c-1] = 0;
            }
            else if(tipo_vacio == "O2" && (typeof datos_barras[f][c] != 'number')){
                tiem_bar_aux[c-1] = Math.abs(((sumas[f]/count_fila[f]) * tiempo_esc)/max_min_bar[0]);
            }
            else{  
                tiem_bar_aux[c-1] = Math.abs((datos_barras[f][c] * tiempo_esc)/max_min_bar[0]);
            }

        }
        tiem_bar.push(tiem_bar_aux);
        tiem_bar_aux = [];
    }

    let entregador_auxiliar_t = [];
    let entregador_auxiliar_c = [];
    let tiempo_entrega = [];
    let canal_entrega = [];

    for(var f = 0; f < datos_barras.length; f++){
        for(var c = 1; c < datos_barras[f].length; c++){
            if(typeof datos_barras[f][c] != 'number' && tipo_vacio == "O2"){
                datos_barras[f][c] = sumas[f];
            }
            entregador_auxiliar_c[c-1] = eje_espacial_barras(max_min_bar[0],datos_barras[f][c],tiem_bar[f][c-1])[0];
            entregador_auxiliar_t[c-1] = eje_espacial_barras(max_min_bar[0],datos_barras[f][c],tiem_bar[f][c-1])[1];
        }
        canal_entrega.push(entregador_auxiliar_c);
        tiempo_entrega.push(entregador_auxiliar_t);
        entregador_auxiliar_t = [];
        entregador_auxiliar_c = [];
    }

    graficador("G2");

    return [frec_baras,tiempo_entrega,canal_entrega,cabecera]

}


// ----------------------------------------------------------------------------------------------------------------------
// FUNCIONES GRAFICO DE PASTEL

//Permite asociar cada rebanada del grafico de pastel a una frecuencia puntual asociada a una nota musical.
function escalador_frecuencias_pastel(tiempo_esc,tipo_vacio){

    let datos_pastel = extraer_valores();
    reemplazar_por_promedio(datos_pastel)
    datos_pastel = retornar_varias_columnas(datos_pastel);
    let cabecera_pastel = extraer_columnas(datos_pastel,"tiempo");
    datos_pastel = extraer_columnas(datos_pastel,"fila");
    let frec_ref = escala_musica();
    let frec_fin = [];
    let tiem_fin = [];
    let canal = [4];
    
    let sumas = [];
    let suma_t = [];
    let count = 0;
    let n_datos = [];
    let porce = [];

    for(var f = 0; f < datos_pastel.length; f++){
        sumas = 0;
        count = 0;
        for(var c = 0; c < datos_pastel[f].length; c++){
            if(typeof datos_pastel[f][c] == 'number'){
                sumas = sumas +  datos_pastel[f][c];
                count++;
            }
            else if(tipo_vacio == "O1" && (typeof datos_pastel[f][c] != 'number')){
                datos_pastel[f][c] = 0;
            }
        }
        suma_t[f] = sumas;
        n_datos[f] = count;
    }



    //Cambio para el tipo de vacio 2
    for(var f = 0; f < datos_pastel.length; f++){
        for(var c = 0; c < datos_pastel[f].length; c++){
            if(tipo_vacio == "O2" && (typeof datos_pastel[f][c] != 'number')){
                if(n_datos[f] == 0){
                    suma_t[f] = 0;
                }
                else{
                    suma_t[f] = suma_t[f] + suma_t[f]/n_datos[f];
                }
            }
        }
    }

    Logger.log("Suma verif + " + suma_t + "datos" + n_datos); 

    for(var i = 0; i < suma_t.length; i++){
        porce[i] = suma_t[i]/(suma_t.reduce((a, b) => a + b, 0));
        tiem_fin[i] = tiempo_esc * porce[i];
        frec_fin[i] = frec_ref[i]
    }

    graficador("G3");

    Logger.log([frec_fin,tiem_fin,canal,cabecera_pastel]);
    return [frec_fin,tiem_fin,canal,cabecera_pastel];

}




// ----------------------------------------------------------------------------------------------------------------------
// -------------------- FUNCIONES COMPLEMENTARIAS FUNDAMENTALES ---------------------------------------------------------
// ----------------------------------------------------------------------------------------------------------------------

// --------------------------------------------------------------------------------------------------------------------
// Funcion para calculo de maximo y minimo de una matriz (array multidimensional) ignorando la primera columna.

//Extrae el valor maximo y minimo de una matriz
function max_min_mat(matriz){
    var max_min_local = [];
    var cont = 0;

    for(var c = 1; c < (matriz[0].length) ; c++){
        for(var f = 0; f < matriz.length; f++){

            if(matriz[f][c] != "NO"){
            max_min_local[cont] = matriz[f][c]
            cont++; 
            }
        }
    }

    return [Math.max.apply(null,max_min_local),Math.min.apply(null,max_min_local)]
}


// --------------------------------------------------------------------------------------------------------------------
// Funcion para retornar las columnas de datos como un array de arrays de columnas, o devuelve la escala temporal como 
// un unico array
function extraer_columnas(datos,opcion){
     
    var datos_c = [];
    var datos_ret = [];
    
    if(opcion == "tiempo"){
        for(f = 0; f < datos.length; f++ ){
            datos_c[f] = datos[f][0];
        }
        datos_ret = datos_c;
    }
    else if(opcion == "fila"){

      for(var f = 0; f < datos.length; f++){
          for(var c = 1; c < datos[f].length; c++){
              datos_c[c] = datos[f][c];
          }
          datos_ret.push(datos_c);
          datos_c = [];
      }

    }
    else{
        for(c = 1; c < datos[0].length; c++ ){

            for(f = 0; f < datos.length; f++){
                datos_c[f] = datos[f][c];
            }
            datos_ret.push(datos_c);
            datos_c = [];
        }
    }

    return datos_ret;
}

// --------------------------------------------------------------------------------------------------------------------
// Funcion para extraer la duración total de la sonificacion
function distancia_puntos(matriz_g){

    let solo_dato = extraer_columnas(matriz_g,"datos");
    let solo_tiempo = extraer_columnas(matriz_g,"tiempo");
    let dist_t = [];

    for(var c = 0; c < solo_dato.length; c++){
        dist_t[c] = distancia_dos_vec_sin_NO(solo_dato[c],solo_tiempo);
    }

    return dist_t;
}

//Calcula la distancia entre puntos de un arreglo de datos, sin contar valores faltantes o inconsistentes
function distancia_dos_vec_sin_NO(vect1_d,vect1_t){

    let count = 0;
    let vect1_d_aux = [];
    let vect1_t_aux = [];
    let dist_parcial = [];
    for(var i = 0; i < vect1_d.length; i++){
  
        if(vect1_d[i] != "NO"){
          vect1_d_aux[count] = vect1_d[i];
          vect1_t_aux[count] = vect1_t[i];
          count++;
        }
    }

    if(vect1_d_aux.length == 1){
        dist_parcial[0] = 0;
    }
    else{
    for(var j = 0; j < vect1_d_aux.length - 1; j++){
        dist_parcial[j] = Math.sqrt(Math.pow(vect1_d_aux[j+1] - vect1_d_aux[j],2)+Math.pow(vect1_t_aux[j+1] - vect1_t_aux[j],2));
    }
    }

    return dist_parcial;
}


// Funcion para obtener canales de audio sobre los cuales trabajar
function eje_espacial(espacio_nw){
    
    var r_t_max_min = [Math.max.apply(null,espacio_nw),Math.min.apply(null,espacio_nw)];

    if(r_t_max_min[1] < 0){
        for(var i = 0; i < espacio_nw.length; i++){
            espacio_nw[i] = espacio_nw[i] + r_t_max_min[1];
        }
        r_t_max_min = [Math.max.apply(null,espacio_nw),Math.min.apply(null,espacio_nw)];
    } 
  
    var secciones = seccionador(r_t_max_min[0],r_t_max_min[1]);
    var canales = [];

    for( var j = 0; j < espacio_nw.length; j++ ){
        
        switch(true){
          case (espacio_nw[j] >= secciones[0][0] && espacio_nw[j] < secciones[0][1]):
            canales[j] = 1;
            break;
          case (espacio_nw[j] >= secciones[1][0] && espacio_nw[j] < secciones[1][1]):
            canales[j] = 2;
            break;
          case (espacio_nw[j] >= secciones[2][0] && espacio_nw[j] < secciones[2][1]):
            canales[j] = 3;
            break;
          case (espacio_nw[j] >= secciones[3][0] && espacio_nw[j] < secciones[3][1]):
            canales[j] = 4;
            break;
          case (espacio_nw[j] >= secciones[4][0] && espacio_nw[j] < secciones[4][1]):
            canales[j] = 5;
            break;
          case (espacio_nw[j] >= secciones[5][0] && espacio_nw[j] < secciones[5][1]):
            canales[j] = 6;
            break;
          case (espacio_nw[j] >= secciones[6][0] && espacio_nw[j] <= secciones[6][1]):
            canales[j] = 7;
            break;
        }
    }

    return canales;
}

//Permite generar 7 rangos utilizables en funcion de un valor maximo y minimo
function seccionador(maximo, minimo){

    var tam_secc = (maximo - minimo)/7
    var ini_secc = tam_secc + minimo;

    var secc1 = [minimo, ini_secc];
    var secc2 = [ini_secc, ini_secc + tam_secc];
    var secc3 = [ini_secc + tam_secc, ini_secc + (2*tam_secc)];
    var secc4 = [ini_secc + (2*tam_secc), ini_secc + (3*tam_secc)];
    var secc5 = [ini_secc + (3*tam_secc), ini_secc + (4*tam_secc)];
    var secc6 = [ini_secc + (4*tam_secc), ini_secc + (5*tam_secc)];
    var secc7 = [ini_secc + (5*tam_secc), ini_secc + (6*tam_secc)];


    var secciones = [secc1,secc2,secc3,secc4,secc5,secc6,secc7];

    return secciones;
}

//Permite generar canales de audio espaciales para el grafico de barras
function eje_espacial_barras(maxim,dato,tiempo){

    let ref_canal = 7; 
    let canal = (dato*ref_canal)/maxim;
    let canal_dato = [];
    let segmento = 0;
    let t_final = [];

    if(canal > 0){

        canal = Math.ceil(canal);

        for(var i = 1; i <= canal; i++){
            canal_dato[i-1] = i;
        }
    }else{

        canal = Math.ceil(Math.abs(canal));

        for(var j = 0; j < canal; j++){
            canal_dato[j] = ref_canal - j;
        }
    }

    segmento = tiempo/canal_dato.length;

    for(var t=0; t < canal_dato.length; t++){
      t_final[t] = segmento;
    }

    return [canal_dato,t_final];

}


// --------------------------------------------------------------------------------------------------------------------
// Funcion para extraer la duración total de la sonificación

function tiempo_total(tiempo){
    
    var aux = 0;
    var duracion = 0;

    for(t = 0; t < tiempo.length; t++){
        if(tiempo[t] > aux){
            aux = tiempo[t]
            duracion = aux;
        }
        else{
          duracion = aux + (aux - tiempo[t])
        }
    }

    return duracion;
}


//----------------------------------------------------------------------------------------------------------------------------------
//Funcion de correccion de espacios vacios o caracteres especiales, si se encuentra un espacio vacio o un caracter especial, se
//reemplaza por el promedio de los datos existentes o se coloca el delimitador "NO" para ser procesado posteriormente. Si toda la
//columna esta vacía, se elimina la columna del procesamiento, los datos originales no se afectan.

function identificar_vacios_especial(datos,tipo_reemplazo){
    
    let count = [];
    let count1 = [];

    for(var f = 0; f < datos.length; f++){

        if(typeof datos[f][0] != 'number'){
            datos.splice(f,1);
        }

        for(var c = 1; c < datos[0].length; c++){

            if(f == 0){
              count[c] = 0;
            }
       
            //Separador de numeros es la "," si se coloca "." el entorno lo reconoce como si fuera una fecha, 1.5 -> 01/05/2021
            if(typeof datos[f][c] != 'number'){
                datos[f][c] = "NO"
      
                //Si toda la columna esta vacia o esta llena de strings se ignora toda la columna:
                count[c] = count[c] + 1;       
              
                if(count[c] == datos.length){
                    
                    for(var i = 0; i < datos.length; i++){
                        datos[i].splice(c, 1);
                    }
                    count[c] = 0;
                }
            }
        }
    }
    
    //CASO 1: dichos valores se reemplazaran por el promedio de los valores existentes 
    if(tipo_reemplazo == "O2"){
      
        //Logger.log("Entro")
    
        let promedios = [];
        let suma = [];
        let mi_app = SpreadsheetApp;
        let hoja_actual = mi_app.getActiveSpreadsheet().getActiveSheet();
        let rango = hoja_actual.getActiveRange();
        
      
        //Calcula el promedio de las columnas:
        for(var f = 0; f < datos.length; f++){

            for(var c = 1; c < datos[0].length; c++){


                if( f == 0){
                    suma[c] = 0;
                    count1[c] = 0;
                }
                
                if(datos[f][c] != "NO"){
                suma[c] = suma[c] + datos[f][c];
                count1[c] = count1[c] + 1;
                }
                
                if(f == datos.length - 1){
                    promedios[c] = suma[c]/count1[c];
                    //Logger.log("Cuenta" + count)
                    //Logger.log("Suma = " + suma);
                }
            }
        }

        //Logger.log("Promedios " +  promedios);

        //Reemplaza los valores correspondientes por el promedio calculado:
        for(var f = 0; f < datos.length; f++){
            for(var c = 1; c < datos[0].length; c++){
              
                //Se reemplaza el valor por el promedio
                if(datos[f][c] == "NO"){
                    datos[f][c] = promedios[c];
                }

            }
        }

      rango.setValues(datos);      

    }

    return datos;

}

//Funcion de uso para el grafico de linea, en caso de tener una unica linea, coloca otra para el eje espacial, espaciada
//de manera igual todos los puntos.
function retornar_varias_columnas(datos_in){

  //Si solo se coje una columna rellenar con valores igualmente espaciados (espaciamiento de 1)
    if(datos_in[0].length == 1){

        for(var i = 0; i < datos_in.length; i++){

            datos_in[i] = [i+1 ,datos_in[i][0]]
        }
        return datos_in;
    } 
    else{

        return datos_in;
    }
}


//Reemplaza valores faltantes o inconsistentes con el promedio de la agrupacion
function reemplazar_por_promedio(data){
    
    let mi_app = SpreadsheetApp;
    let hoja_actual = mi_app.getActiveSpreadsheet().getActiveSheet();
    let rango = hoja_actual.getActiveRange();
    let suma_p = 0;
    let suma_t = [];
    let count = 0;
    let count_t = [];

 
    for (var f=0; f<data.length; f++) {
      for (var c=1; c<data[f].length; c++) {
        if ( typeof data[f][c] == 'number') 
        {
          sumap = suma_p + data[f][c];
          count++;
        }
      }
      suma_t[f] = sumap;
      count_t[f] = count;
      sumap = 0;
      count = 0;
    }

    Logger.log("Sumas " + suma_t + " Promedios " + count_t)

    for (var f=0; f<data.length; f++) {
      for (var c=1; c<data[f].length; c++) {
        if ( typeof data[f][c] != 'number') 
        {
          data[f][c] = suma_t[f]/count_t[f];
        }
      }
    }

    Logger.log("Datos finales" + data)
    rango.setValues(data);
}


//Devuelve las frecuencias de las distintas notas musicales en un rango definido
function escala_musica(){

    let nota_base = 293.66 //Corresponde a RE4
    let nota_fin = 1478 //Corresponde a FA6# + 1 [Hz] (evitar pasarse de nota)
    let nota_aux = 0;
    let relacion_semitono = Math.pow(2,1/12) //Se calcula conociendo un semitono entre sostenido y nota siguiente
    let aumento_semitono = 0;
    let escala_musical = [];

    while(nota_aux < nota_fin){

        nota_aux = nota_base * Math.pow(relacion_semitono,aumento_semitono)
        escala_musical[aumento_semitono] = nota_aux;
        aumento_semitono++;

    }
    
    //Logger.log(escala_musica);
    return escala_musical;
}

//Dependiendo del tipo de gráfico devuelve los valores necesarios hacía el cliente
function colocador_datos(tiempo,tipo_vac,tipo_grafico,rango_cel){

    let datos_retorno = [];

    //Informacion enviada para el grafico de linea
    if(tipo_grafico == "G1"){
        datos_retorno = escalador_frecuencias(tiempo,tipo_vac,"linea",rango_cel);
    }
    //Informacion enviada para el grafico de barras
    else if(tipo_grafico == "G2"){
        datos_retorno = escalador_frecuencias_barras(tiempo,tipo_vac,rango_cel);
    }
    //Informacion enviada para el grafico de pastel
    else if(tipo_grafico == "G3"){
        datos_retorno = escalador_frecuencias_pastel(tiempo,tipo_vac,rango_cel);
    }
    //Informacion enviada para el grafico de dispersion
    else{
        //Grafico de Dispersion
        datos_retorno = escalador_frecuencias(tiempo,tipo_vac,"dispersion",rango_cel);
    }
    
    //Logger.log(datos_retorno);
    return JSON.stringify(datos_retorno);

}

function devolver_Nombre() {

    var about = Drive.About.get();
    var nombre = about.user.displayName;
    return JSON.stringify(nombre);

}

//Permite compartir la hoja de cálculo con permisos y un rol suficientes para tener acceso al add-on
function compartir_archivo(correo){
    let url = SpreadsheetApp.getActive().getUrl();
    let archivo_actual = SpreadsheetApp.openByUrl(url);
    let id = archivo_actual.getId();

    try{
        //f.addViewer(email);
        let mensaje = "Archivo de Spreadseet Compartido";  // Please set the custom message here.
        let usuario = {role: "writer", type: "user", value: correo};
        Drive.Permissions.insert(usuario, id, {emailMessage: mensaje});
        return JSON.stringify("CORRECTO");
    }
    catch (e) {
        Logger.log(e);
        return JSON.stringify("ERROR");
    }
}
