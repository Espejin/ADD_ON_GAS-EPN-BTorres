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

      /*
      for(var i=0; i<(celdas[0]).length; i++){
         datos.addColumn(Charts.ColumnType.NUMBER, celdas[0][i]);
      }

      for(var j=1; j<celdas.length; j++){
         datos.addRow(celdas[j]);
      }

      Logger.log(datos);

      */

}

function graficador(){

      var mi_app = SpreadsheetApp;
      var hoja_actual = mi_app.getActiveSpreadsheet().getActiveSheet();

      var rango = hoja_actual.getActiveRange();

      var g_linea = hoja_actual.newChart();

      g_linea.addRange(rango)
         .setChartType(Charts.ChartType.LINE)
         .setOption('title','Mi gráfico de Linea!')
         .setPosition(5, 5, 0, 0); 
      hoja_actual.insertChart(g_linea.build());
}

// --------------------------------------------------------------------------------------------------------------------
//Escalado desde 293.7 [Hz], D (RE) en 4ta escala, hasta 1976 [Hz], B (SI) en 6ta escala, se pasa la 4ta escala semi-
//completa, 5ta y 6ta escala completa, se ascendera de 10 en 10 [Hz] de modo que el cambio sea notorio, pero no molesto.


function escalador_frecuencias(){

  var aux = 293.7;
  var frecuencias = [];

    for (var i = 0; i < Math.floor((1976/10)-(293.7/10)) + 1; i++) {
        frecuencias[i] = aux;
        aux = aux + 10;

        if( frecuencias[i] + 10 > 1976 ){
            frecuencias[i+1] = 1976
        }
    }
    
    var datos = extraer_valores();
    //var datos_aux = [];
    var max_min_d = max_min_mat(datos);
    var len_frec = frecuencias.length;
    var count = 0;
    var distancia = distancia_puntos(datos);

    //Logger.log(datos[0]);
    //Logger.log(datos);

    //saltarse primera columna porque contiene la escala en el eje x del grafico lineal.

    if(max_min_d[1] < 0){

        for(var c = 1; c < (datos[0].length) ; c++){
            for(var f = 0; f < datos.length; f++){
                datos[f][c] = ((Math.round(((datos[f][c] + (max_min_d[1]*(-1)))/(max_min_d[0] + (max_min_d[1]*(-1))))*(len_frec-1))) - (len_frec-1))*(-1);
                datos[f][c] = frecuencias[datos[f][c]];
                count++;
            }
        }

    }else{

        for(var c = 1; c < (datos[0].length) ; c++){
            for(var f = 0; f < datos.length; f++){
                datos[f][c] = ((Math.round(((datos[f][c])/(max_min_d[0]))*(len_frec-1))) - (len_frec-1))*(-1);
                datos[f][c] = frecuencias[datos[f][c]];
                count++;
            }
        }
    }

    //Logger.log(datos);

    let datos_aux = escalar_subida_bajada_frecuencias(datos,frecuencias);
    var datos_ref = extraer_columnas(datos,"frecuencias");
    datos_aux.push(datos_ref);
    Logger.log(datos_ref)
    var tiempo_f = escalador_tiempo(20,datos_aux,distancia);
    //Logger.log("Longitud real: "+ datos_aux[0].length);
    //escalador_tiempo(1,datos);
    //Logger.log(datos_aux);
    //var entregar = [datos_aux,tiempo_f]
    //Logger.log(entregar);
    return JSON.stringify([datos_aux,tiempo_f,datos_ref]);
    //

}

function escalador_tiempo(tiempo_esc,dat_frec,dist){
    var max_d = 0;
    for(var i = 0; i < dist.length; i++){
        max_d = dist[i].reduce((a, b) => a + b, 0);
        for(var j = 0; j < dist[0].length; j++){
            (dist[i])[j] = ((dist[i])[j]/max_d)*tiempo_esc;
        }
    }
    
    //Logger.log("escalado a 3 = " + dist);

    var dat_frec_ref = dat_frec[dat_frec.length-1];
    dat_frec.pop();
    var cuenta = [];
    var count = 0;
    var ind = [];
    var vec_tiempo = [];
    var vec_tiempo_t = [];

    //Logger.log("final");
    //Logger.log(dat_frec_ref);

    for(var c = 0; c < dat_frec.length; c++){
        for(var f = 0; f < dat_frec[c].length; f++){
          
            if(dat_frec[c][f] == dat_frec_ref[c][count]){
                ind[count] = f;
                count++;
            }
        }
        cuenta.push(ind);
        ind = [];
        count = 0;
    }

    //Logger.log('la cuenta es: ' +  cuenta);

    count = -1;
    for(var c = 0; c < dat_frec.length; c++){
        for(var f = 0; f < dat_frec[c].length; f++){
          
            if(dat_frec[c][f] == dat_frec[c][cuenta[c][count+1]] && dat_frec[c][f] != dat_frec[c][cuenta[c][cuenta[c].length - 1]]){
                
                //mi_aux = cuenta[c][count]
                count++;
                //Logger.log("Cuenta: " + count);
                vec_tiempo[f] = (dist[c][count])/(cuenta[c][count+1]-cuenta[c][count]);
            }
            else{
                vec_tiempo[f] = (dist[c][count])/(cuenta[c][count+1]-cuenta[c][count]);
            }
        }
        vec_tiempo_t.push(vec_tiempo);
        vec_tiempo = [];
        count = -1;
    }

    

    //Logger.log("indices : " + vec_tiempo_t[0].length + '-' + dat_frec[0].length);
    //Logger.log("llenado : " + vec_tiempo_t[0].reduce((a, b) => a + b, 0));
    return vec_tiempo_t;

}

function entregador(t_total){
  
  //var frec_entr = escalador_frecuencias();
  //var dist_graf = distancia_puntos(extraer_valores());
  var mi_data = extraer_valores();

  //Logger.log("frec : " + frec_entr);
  //var tiem_esc =  escalador_tiempo(t_total,frec_entr,dist_graf)
  var entregar = [escalador_frecuencias(),escalador_tiempo(t_total,escalador_frecuencias(),distancia_puntos(mi_data))];

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
// -------------------- FUNCIONES COMPLEMENTARIAS FUNDAMENTALES ---------------------------------------------------------
// ----------------------------------------------------------------------------------------------------------------------

// --------------------------------------------------------------------------------------------------------------------
// Funcion para calculo de maximo y minimo de una matriz (array multidimensional) ignorando la primera columna.

function max_min_mat(matriz){
    var max_min_local = [];
    var cont = 0;

    for(var c = 1; c < (matriz[0].length) ; c++){
        for(var f = 0; f < matriz.length; f++){
            max_min_local[cont] = matriz[f][c]
            cont++; 
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

function distancia_puntos(matriz){

    var dist = [];
    var dist_t = [];
    var count = 0;

    for(var c = 1; c < matriz[0].length ; c++){
        for(var f = 0; f < matriz.length - 1; f++){
            dist[count] = Math.sqrt(Math.pow(matriz[f+1][c] - matriz[f][c],2)+Math.pow(matriz[count+1][0]-matriz[count][0],2));
            count++;
        }
        dist_t.push(dist);
        dist = [];
        count = 0;
    }
    return dist_t;
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


/*
function cargar_dtm() {
      var javascript = UrlFetchApp.fetch("https://code.highcharts.com/modules/sonification.js").getContentText();
      eval(javascript);
}
*/
