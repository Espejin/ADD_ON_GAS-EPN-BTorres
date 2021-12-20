// ----------------------------------------------------------------------------------------------------------------------
// -------------------- FUNCIONES DE CREACION DE ADD - ON DENTRO DE SPREADSHEETS ----------------------------------------
// ----------------------------------------------------------------------------------------------------------------------

// Permite pasar datos entre el servidor y el cliente.
function doGet() {
var template = HtmlService.createTemplateFromFile('barra_add_on');

return template.evaluate().setSandboxMode(HtmlService.SandboxMode.IFRAME);

}

function onOpen(e) {
      SpreadsheetApp.getUi().createAddonMenu()
          .addItem('Ejecutar Add-On', 'mostrarComplemento')
          .addToUi();
      mostrarComplemento()
      //cargar_dtm();
    }

function onInstall(e) {
      onOpen(e);
    }

function mostrarComplemento() {
      var ui = HtmlService.createHtmlOutputFromFile('barra_add_on')
          .setTitle('Add-On de interpretación gráfica')
          .setSandboxMode(HtmlService.SandboxMode.IFRAME);
      SpreadsheetApp.getUi().showSidebar(ui);
    }



/*function doGet(){

    probador();

    var template = HtmlService
                 .createTemplateFromFile('barra_add_on');

    var htmlOutput = template.evaluate()
                   .setSandboxMode(HtmlService.SandboxMode.NATIVE);

    return htmlOutput;

    //return HtmlService.createHtmlOutputFromFile('barra_add_on');
    
    
    return HtmlService
      .createTemplateFromFile('barra_add_on')
      .evaluate();
`}`
    */

// ----------------------------------------------------------------------------------------------------------------------
// -------------------- FUNCIONES DE CARACTER FUNCIONAL DEL ADD - ON ----------------------------------------------------
// ----------------------------------------------------------------------------------------------------------------------

function bienvenida() {
      var ui = SpreadsheetApp.getUi();
      ui.alert("Bienvenido al Add-On");
    }


function extraer_valores(){
      
      var mi_app = SpreadsheetApp;
      var hoja_actual = mi_app.getActiveSpreadsheet().getActiveSheet();

      //Se recogen las celdas que hayan sido seleccionadas.
      var celdas = hoja_actual.getActiveRange().getValues();
      
      return celdas;

}

function graficador(tipo){

      var mi_app = SpreadsheetApp;
      var hoja_actual = mi_app.getActiveSpreadsheet().getActiveSheet();

      var rango = hoja_actual.getActiveRange();

      if(tipo == "G1"){

          var g_linea = hoja_actual.newChart();

          g_linea.addRange(rango)
            .setChartType(Charts.ChartType.LINE)
            .setOption('title','Mi gráfico de Linea!')
            .setOption('interpolateNulls',true)
            .setPosition(5, 5, 0, 0); 
          hoja_actual.insertChart(g_linea.build());

      }
      else if(tipo == "G2"){
          var g_barra = hoja_actual.newChart()

          g_barra.addRange(rango)
            .setChartType(Charts.ChartType.BAR)
            .setOption('title','Mi gráfico de Barras')
            .setPosition(5,5,0,0);
          hoja_actual.insertChart(g_barra.build());
      }
      else if(tipo == "G3"){
          var g_pastel = hoja_actual.newChart()

          g_pastel.addRange(rango)
            .setChartType(Charts.ChartType.PIE)
            .setOption('title','Mi gráfico de Pastel')
            .setPosition(5,5,0,0);
          hoja_actual.insertChart(g_pastel.build());
      }
      else if(tipo == "G4"){

          var g_dispersion = hoja_actual.newChart()

          g_dispersion.addRange(rango)
            .setChartType(Charts.ChartType.SCATTER)
            .setOption('title','Mi gráfico de Dispersion')
            .setPosition(5,5,0,0);
          hoja_actual.insertChart(g_dispersion.build());
      }

}

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

    //Logger.log("Mis frecuencias: " + frecuencias);
    
    var datos = extraer_valores();
    Logger.log("Datos llegan: " + datos);
    //Verificar si se tiene mas de una columna, caso contrario rellenar la primera columna
    datos = retornar_varias_columnas(datos);
    Logger.log("Verifica 2 columnas: " + datos);
    datos = identificar_vacios_especial(datos,tipo_vacio);
    Logger.log("Se devuelven al final: " + datos);
    var puntos_frec = [];
    var puntos_frec_it = [];
    //var datos_aux = [];
    var max_min_d = max_min_mat(datos);
    var len_frec = frecuencias.length;
    var count = 0;
    var count1 = 0;
    var distancia = distancia_puntos(datos);
    Logger.log("Mi Distancia quedo = " +  distancia);
    var canales = eje_espacial(extraer_columnas(datos,"tiempo"));

    //Logger.log("Probando canal: " + canales);
    //Logger.log(datos);

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
                    //count++;
                }
            }
                puntos_frec.push(puntos_frec_it);
                puntos_frec_it = [];
        }
    }

    //Logger.log("Mis Datos :" + puntos_frec);

    //let datos_aux = escalar_subida_bajada_frecuencias(datos,frecuencias);
    //var datos_ref = extraer_columnas(datos,"frecuencias");
    //datos_aux.push(datos_ref);
    //Logger.log("Referencia" + datos_aux);
    //Logger.log(distancia);
    
    var tiempo_f = escalador_tiempo(tiempo_osc,distancia);
  
    //Logger.log("Longitud real: "+ datos_aux[0].length);
    //escalador_tiempo(1,datos);
    //Logger.log(datos_aux);
    //var entregar = [datos_aux,tiempo_f]
    //Logger.log(entregar);
    //Logger.log(tiempo_f);
    //Logger.log([datos_aux,tiempo_f[0],datos_ref,canales]);
    return [puntos_frec,tiempo_f,canales,[]];
    //

}


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
    
    Logger.log("escalado a 3 = " + tiemp_final);
    return tiemp_final;

}

function entregador(t_total){
  
    //var frec_entr = escalador_frecuencias();
    //var dist_graf = distancia_puntos(extraer_valores());
    var mi_data = extraer_valores();

    //Logger.log("frec : " + frec_entr);
    //var tiem_esc =  escalador_tiempo(t_total,frec_entr,dist_graf)
    var entregar = [escalador_frecuencias(),escalador_tiempo(t_total,escalador_frecuencias()[0],distancia_puntos(mi_data))];

    //Logger.log("tiempo : " + tiem_esc);
    Logger.log(entregar);
    return JSON.stringify(entregar);
}

function probador(){
    var datos = escalador_frecuencias();
    Logger.log(datos);
    return JSON.stringify(datos);

}

// ----------------------------------------------------------------------------------------------------------------------
// FUNCIONES GRAFICO DE BARRAS

function escalador_frecuencias_barras(tiempo_esc,tipo_vacio){

    let datos_barras = extraer_valores();
    datos_barras = retornar_varias_columnas(datos_barras);
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
            frec_baras_aux[c-1] = 293.7 + (10*(datos_barras.length - f));

            if(typeof datos_barras[f][c] == 'number'){
                sumas[f] = sumas[f] +  datos_barras[f][c];
                count_fila[f] = count_fila[f]+1;
            }
        }
        frec_baras.push(frec_baras_aux);
        frec_baras_aux = [];
    }

    Logger.log(sumas);

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

    //Logger.log(tiem_bar)
    //Logger.log(tiempo_entrega);
    //Logger.log(canal_entrega);
    //Logger.log(frec_baras);
    Logger.log(frec_baras,tiempo_entrega,canal_entrega,cabecera);
    return [frec_baras,tiempo_entrega,canal_entrega,cabecera]

}


// ----------------------------------------------------------------------------------------------------------------------
// FUNCIONES GRAFICO DE PASTEL

function escalador_frecuencias_pastel(tiempo_esc,tipo_vacio){

    let datos_pastel = extraer_valores();
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

    Logger.log([frec_fin,tiem_fin,canal,cabecera_pastel]);
    return [frec_fin,tiem_fin,canal,cabecera_pastel];

}




// ----------------------------------------------------------------------------------------------------------------------
// -------------------- FUNCIONES COMPLEMENTARIAS FUNDAMENTALES ---------------------------------------------------------
// ----------------------------------------------------------------------------------------------------------------------

// --------------------------------------------------------------------------------------------------------------------
// Funcion para calculo de maximo y minimo de una matriz (array multidimensional) ignorando la primera columna.

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


//----------------------------------------------------------------------------------------------------------------------
// Función de completado de frecuencias, permite colocar frecuencias intermedias con el fin de evitar cambios demasiado
// bruscos en la reproduccion del audio.

function escalar_subida_bajada_frecuencias(matriz,frecuencias){
    
    var auxiliar = [];
    var frec_fin = [];
    var rango_din = [];
    var count = 0;
    
    for(var c = 1; c < (matriz[0].length) ; c++){
        for(var f = 0; f < matriz.length; f++){
            if(f == (matriz.length-1)){
              auxiliar[count] = matriz[f][c];
            }
            else if(matriz[f][c] > matriz [f+1][c]){

                rango_din = frecuencias.slice(frecuencias.findIndex(element => element === matriz[f+1][c])+1,frecuencias.findIndex(element => element === matriz[f][c])+1);
                rango_din = rango_din.sort((a, b) => b - a);

                for(var d = 0; d < rango_din.length; d++){
                    auxiliar[count] = rango_din[d];
                    count++;
                }
                rango_din = [];
            }
            else{
                
                rango_din = frecuencias.slice(frecuencias.findIndex(element => element === matriz[f][c]),frecuencias.findIndex(element => element === matriz[f+1][c]));
                rango_din = rango_din.sort((a, b) => a - b );

                for(var d = 0; d < rango_din.length; d++){
                    auxiliar[count] = rango_din[d];
                    count++;
                }
                rango_din = [];
            }
            
        }
        frec_fin.push(auxiliar);
        auxiliar = [];
        count = 0;
    }


    return frec_fin;
}

// --------------------------------------------------------------------------------------------------------------------
// Funcion para retornas las columnas de datos como un array de arrays de columnas, o devuelve la escala temporal como 
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
// Funcion para extraer la duración total del 

function distancia_puntos(matriz_g){

    let solo_dato = extraer_columnas(matriz_g,"datos");
    let solo_tiempo = extraer_columnas(matriz_g,"tiempo");
    let dist_t = [];

    for(var c = 0; c < solo_dato.length; c++){
        dist_t[c] = distancia_dos_vec_sin_NO(solo_dato[c],solo_tiempo);
    }

    return dist_t;
}


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
    
    //Logger.log("tiempo : " + espacio_nw);
    
    var r_t_max_min = [Math.max.apply(null,espacio_nw),Math.min.apply(null,espacio_nw)];

    if(r_t_max_min[1] < 0){
        for(var i = 0; i < espacio_nw.length; i++){
            espacio_nw[i] = espacio_nw[i] + r_t_max_min[1];
        }
        r_t_max_min = [Math.max.apply(null,espacio_nw),Math.min.apply(null,espacio_nw)];
    } 

    //Logger.log("max : " + r_t_max_min);
    
    //Logger.log("vector :" + espacio_nw)
  
    var secciones = seccionador(r_t_max_min[0],r_t_max_min[1]);
    //Logger.log("secciones: " + secciones);
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
        //Logger.log(canales[j])
    }

    return canales;
}

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
// Funcion para extraer la duración total del 

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

function texto_a_voz(bytes){

    const base64 = Utilities.base64Encode(bytes);
    const data = {
        'config' : {
            'languageCode': 'es-ES',
            'audio_channel_count': 2,  
        },
        'audio': {
            'content' : base64
        }

    }

    const params = {
        'method' : 'post',
        'headers': { 
        "Content-Type": "application/json",
    },
        'payload' : JSON.stringify(data),
  };

    const res = UrlFetchApp.fetch('https://speech.googleapis.com/v1/speech:recognize?key=AIzaSyBA6qflEf5lgVEyH55KXVDwiNP05W7aZjk', params);


return JSON.parse(res.getContentText())['results'][0]['alternatives'][0]['transcript'];

}

//----------------------------------------------------------------------------------------------------------------------------------
//Funcion de correccion de espacios vacios o caracteres especiales, si se encuentra un espacio vacio o un caracter especial, se
//reemplaza por el promedio de los datos existentes o se coloca el delimitador "NO" para ser procesado posteriormente. Si toda la
//columna esta vacía, se elimina la columna del procesamiento, los datos originales no se afectan.

function identificar_vacios_especial(datos,tipo_reemplazo){
    
    let count = [];

    Logger.log(datos);

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
                Logger.log("Entra contador " + count[c])          
              
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
      
        Logger.log("Entro")
    
        let promedios = [];
        let suma = [];
      
        //Calcula el promedio de las columnas:
        for(var f = 0; f < datos.length; f++){

            for(var c = 1; c < datos[0].length; c++){

                if( f == 0){
                    suma[c] = 0
                }
                
                if(datos[f][c] != "NO"){
                suma[c] = suma[c] + datos[f][c];
                }
                
                if(f == datos.length - 1){
                    promedios[c] = suma[c]/count[c];
                    Logger.log("Cuenta" + count)
                    Logger.log("Suma = " + suma);
                }
            }
        }

        Logger.log("Promedios " +  promedios);

        //Reemplaza los valores correspondientes por el promedio calculado:
        for(var f = 0; f < datos.length; f++){
            for(var c = 1; c < datos[0].length; c++){
              
                //Se reemplaza el valor por el promedio
                if(datos[f][c] == "NO"){
                    datos[f][c] = promedios[c];
                }

            }
        }


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

function escala_musica(){

    let nota_base = 293.66 //Corresponde a RE4
    let nota_fin = 1478 //Corresponde a FA6# + 1 [Hz] (evitar pasarse de nota)
    let nota_aux = 0;
    let relacion_semitono = Math.pow(2,1/12) //Se calcula conociendo un semitono entre sostenido y nota siguiente
    let aumento_semitono = 0;
    let escala_musical = [];

    while(nota_aux < nota_fin){

        nota_aux = nota_base * Math.pow(relacion_semitono,aumento_semitono)
        //Logger.log("Nota + " + nota_aux + " - " + "semtiono + " + aumento_semitono)
        escala_musical[aumento_semitono] = nota_aux;
        aumento_semitono++;

    }
    
    //Logger.log(escala_musica);
    return escala_musical;
}

//Dependiendo del tipo de gráfico devuelve los valores necesarios hacía el cliente
function colocador_datos(tiempo,tipo_vac,tipo_grafico){

    let datos_retorno = [];

    if(tipo_grafico == "G1"){
        datos_retorno = escalador_frecuencias(tiempo,tipo_vac,"linea");
    }
    else if(tipo_grafico == "G2"){
        datos_retorno = escalador_frecuencias_barras(tiempo,tipo_vac);
    }
    else if(tipo_grafico == "G3"){
        datos_retorno = escalador_frecuencias_pastel(tiempo,tipo_vac);
    }
    else{
        //Grafico de Dispersion
        datos_retorno = escalador_frecuencias(tiempo,tipo_vac,"dispersion");
    }
    
    Logger.log(datos_retorno);
    return JSON.stringify(datos_retorno);

}




function retornar_nombre(){

    var aboutData = DriveApp.About.get();
    var userEmail = aboutData["user"]["emailAddress"];
    var userDisplayName = aboutData["user"]["displayName"];
    Logger.log('Mi nombre : ' + userDisplayName);
    return userDisplayName
}

/*
function cargar_dtm() {
      var javascript = UrlFetchApp.fetch("https://code.highcharts.com/modules/sonification.js").getContentText();
      eval(javascript);
}
*/
