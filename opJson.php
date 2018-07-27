<?php

function getDataJson($json){

    $columns = new ArrayObject();
    $column = new stdClass();
    //column $c->col
    //order by $c->sort
    //function $c->func

    $conditions = new ArrayObject();
    $condition = new stdClass();
    //column $c->col
    //where $c->oper
    //value $c->value
    //dataType $c->type

    $tables = array();

    foreach ($json as $k => $v) {

        //conditions
        if($k == 'root'){
            foreach ($v as $k => $v) {
                if($k == 'conditions' && sizeof($v) > 0){
                    foreach ($v as $k => $v) {
                        foreach ($v as $k => $v) {
                            if($k == 'enabled' && !$v){
                                break;
                            }
                            if($k == 'operatorID'){
                                $condition->oper = $v;
                            }
                            if($k == 'expressions'){
                                $values = sizeof($v);
                                foreach ($v as $k => $v) {
                                    foreach ($v as $k => $v) {
                                        /*
                                        if ($k == 'id')
                                            $condition->col = $v;
                                        */
                                        if ($k == 'id'){
                                            if(empty($condition->col))
                                                $condition->col = $v;
                                            else{
                                                $condition->value = $v;
                                                $conditions->append($condition);
                                                $condition = new stdClass();
                                                break;
                                            }
                                        }

                                        if ($k == 'dataType') {
                                            if(!empty($condition->type))
                                                $condition->type = $condition->type.'::'.$v;
                                            else
                                                $condition->type = $v;
                                        }
                                        if ($k == 'value') {
                                            if(!empty($condition->value)){
                                                $condition->value = $condition->value.'::'.$v;
                                                $conditions->append($condition);
                                                $condition = new stdClass();
                                            }
                                            else {
                                                $condition->value = $v;
                                                if ($values == 2){
                                                    $conditions->append($condition);
                                                    $condition = new stdClass();
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

       //columns
       if ($k == 'columns' && sizeof($v) > 0) {
           foreach ($v as $k => $v) {
               foreach ($v as $k => $v) {
                   if($k == 'sorting'){
                       if ($v == 'Ascending'){
                           $column->sort = 'ASC';
                       }
                       elseif ($v == 'Descending') {
                           $column->sort = 'DESC';
                       }
                       else{
                           $column->sort = '';
                       }
                   }
                   if($k == 'expr'){
                       foreach ($v as $k => $v) {
                           if ($k == 'id') {
                               $column->col = $v;
                               $column->func = '';
                               $columns->append($column);
                               $column = new stdClass();
                               $t = explode('.', $v);
                               array_push($tables, $t[0]);
                           }

                           if ($k == 'func') {
                               $column->func = $v;
                           }
                           if ($k == 'argument') {
                               foreach ($v as $k => $v) {
                                    if($k == 'id'){
                                        $column->col = $v;
                                        $columns->append($column);
                                        $column = new stdClass();
                                        $t = explode('.', $v);
                                        array_push($tables, $t[0]);
                                    }
                               }
                           }
                       }
                   }
               }
           }
       }
    }

    if(sizeof($columns) > 0)
        return createQuery($columns, $conditions, array_unique($tables));
    else
        return '';
}

function createQuery($colums, $conditions, $tables){

    $query     = '';
    $select    = '';
    $orderBy   = '';
    $groupBy   = '';
    $from      = '';
    $where     = '';
    $isGroupBy = false;

    foreach ($tables as $t){
        if(!empty($from))
            $from = $from . ', ';
        $from = $from . ($t == 'DOTACION' ? 'PREVENCION_PERDIDAS.'.$t : 'RIPLEY.'.$t);
    }

    foreach($colums as $c){

        if($c->func == ''){
            if(!empty($select))
                $select = $select . ', ';
            $select = $select . $c->col;

            if(!empty($groupBy))
                $groupBy = $groupBy . ', ';
            $groupBy = $groupBy . $c->col;
        }

        if($c->func != ''){
            $isGroupBy = true;
            switch ($c->func){
                case 'SUM':
                    if(!empty($select))
                        $select = $select . ', ';
                    $select = $select . $c->func .'('.$c->col.')';
                    break;
                case 'COUNT':
                    if(!empty($select))
                        $select = $select . ', ';
                    $select = $select . $c->func .'('.$c->col.')';
                    break;
                case 'CNTDST':
                    if(!empty($select))
                        $select = $select . ', ';
                    $select = $select .'COUNT(DISTINCT '. $c->col .')';
                    break;
                case 'AVG':
                    if(!empty($select))
                        $select = $select . ', ';
                    $select = $select . $c->func .'('.$c->col.')';
                    break;
                case 'MIN':
                    if(!empty($select))
                        $select = $select . ', ';
                    $select = $select . $c->func .'('.$c->col.')';
                    break;
                case 'MAX':
                    if(!empty($select))
                        $select = $select . ', ';
                    $select = $select . $c->func .'('.$c->col.')';
                    break;
            }
        }

        if($c->sort != ''){
            if(!empty($orderBy))
                $orderBy = $orderBy . ', ';
            $orderBy = $orderBy . $c->col . ' ' . $c->sort ;
        }
    }

    if(sizeof($conditions) > 0){

        foreach ($conditions as $c){
                switch ($c->oper){
                    case 'Equal':
                        if(!empty($c->value)){
                            if(!empty($where))
                                $where = $where . ' AND ';

                            if($c->type == 'DateTime')
                                $where = $where . $c->col ." = '". $c->value . "'";
                            else
                                $where = $where . $c->col .' = '. $c->value;
                        }
                        break;
                    case 'NotEqual':
                        if(!empty($c->value)){
                            if(!empty($where))
                                $where = $where . ' AND ';
                            $where = $where . $c->col .' <> '. $c->value;
                        }
                        break;
                    case 'LessThan':
                        if(!empty($c->value)){
                            if(!empty($where))
                                $where = $where . ' AND ';
                            $where = $where . $c->col .' < '. $c->value;
                        }
                        break;
                    case 'LessOrEqual':
                        if(!empty($c->value)){
                            if(!empty($where))
                                $where = $where . ' AND ';
                            $where = $where . $c->col .' <= '. $c->value;
                        }
                        break;
                    case 'GreaterThan':
                        if(!empty($c->value)){
                            if(!empty($where))
                                $where = $where . ' AND ';
                            $where = $where . $c->col .' > '. $c->value;
                        }
                        break;
                    case 'GreaterOrEqual':
                        if(!empty($c->value)){
                            if(!empty($where))
                                $where = $where . ' AND ';
                            $where = $where . $c->col .' >= '. $c->value;
                        }
                        break;
                    case 'IsNull':
                        if(!empty($where))
                            $where = $where . ' AND ';
                        $where = $where . $c->col .' IS NULL ';
                        break;
                    case 'IsNotNull':
                        if(!empty($where))
                            $where = $where . ' AND ';
                        $where = $where . $c->col .' IS NOT NULL ';
                        break;
                    case 'IsTrue':
                        if(!empty($c->value)){
                            if(!empty($where))
                                $where = $where . ' AND ';
                            $where = $where . $c->col .' = 1';//verificar true-false en database
                        }
                        break;
                    case 'NotTrue':
                        if(!empty($c->value)){
                            if(!empty($where))
                                $where = $where . ' AND ';
                            $where = $where . $c->col .' <> 1';//verificar true-false en database
                        }
                        break;
                    case 'InList':
                        if(!empty($c->value)){
                            $list = '';
                            foreach (explode(',', $c->value) as $l){
                                if(!empty($list))
                                    $list = $list .',';
                                $list = $list ."'".$l."'";
                            }
                            if(!empty($where))
                                $where = $where . ' AND ';
                            $where = $where . $c->col .' IN ('. $list .')';
                        }
                        break;
                    case 'NotInList':
                        if(!empty($c->value)){
                            $list = '';
                            foreach (explode(',', $c->value) as $l){
                                if(!empty($list))
                                    $list = $list .',';
                                $list = $list ."'".$l."'";
                            }
                            if(!empty($where))
                                $where = $where . ' AND ';
                            $where = $where .' NOT('. $c->col .' IN ('. $list .'))';
                        }
                        break;
                    case 'Between':
                        if(!empty($c->value)){
                            if(!empty($where))
                                $where = $where . ' AND ';
                            $where = $where . $c->col .' BETWEEN '. explode('::', $c->value)[0] .' AND '.explode('::', $c->value)[1];
                        }
                        break;
                    case 'NotBetween':
                        if(!empty($c->value)){
                            if(!empty($where))
                                $where = $where . ' AND ';
                            $where = $where .' NOT('. $c->col .' BETWEEN '. explode('::', $c->value)[0] .' AND '.explode('::', $c->value)[1].')';
                        }
                        break;
                    case 'StartsWith':
                        if(!empty($where))
                            $where = $where . ' AND ';

                        if(empty($c-value))
                            $where = $where . $c->col ." LIKE '%'";
                        else
                            $where = $where . $c->col ." LIKE '". $c->value ."%'";
                        break;
                    case 'NotStartsWith':
                        if(!empty($where))
                            $where = $where . ' AND ';

                        if(empty($c->value))
                            $where = $where . ' NOT('.$c->col ." LIKE '%'".')';
                        else
                            $where = $where . ' NOT('.$c->col ." LIKE '". $c->value ."%'".')';
                        break;
                    case 'Contains':
                        if(!empty($where))
                            $where = $where . ' AND ';

                        if(empty($c->value))
                            $where = $where . $c->col ." LIKE '%%'";
                        else
                            $where = $where . $c->col ." LIKE '%". $c->value ."%'";
                        break;
                    case 'NotContains':
                        if(!empty($where))
                            $where = $where . ' AND ';

                        if(empty($c->value))
                            $where = $where . ' NOT('.$c->col ." LIKE '%%'".')';
                        else
                            $where = $where . ' NOT('.$c->col ." LIKE '%". $c->value ."%'".')';
                        break;
                    case 'SubQuery':
                        if(!empty($where))
                            $where = $where . ' AND ';
                        $where = $where . $c->col .' = '. $c->value;
                        break;
                    //falta programar, crear los valores
                    case 'InSubQuery':
                        break;
                    //falta programar, crear los valores
                    case 'NotInSubQuery':
                        break;
                    //verificar formato FECHAS en DataBase
                    case 'DateWithinToday':
                        if(!empty($where))
                            $where = $where . ' AND ';
                        $where = $where ." ('". date('Y-m-d') ."' <= ". $c->col ." AND ". $c->col ." < '". date('Y-m-d',strtotime('+1 day')) ."')";
                        break;
                    //verificar formato FECHAS en DataBase
                    case 'DateWithinThisWeek':
                        if(!empty($where))
                            $where = $where . ' AND ';
                        $where = $where ." ('". date('Y-m-d') ."' <= ". $c->col ." AND ". $c->col ." < '". date('Y-m-d',strtotime('+1 week')) ."')";
                        break;
                    //verificar formato FECHAS en DataBase
                    case 'DateWithinPrevWeek':
                        if(!empty($where))
                            $where = $where . ' AND ';
                        $where = $where ." ('". date('Y-m-d',strtotime('-1 week')) ."' <= ". $c->col ." AND ". $c->col ." < '". date('Y-m-d') ."')";
                        break;
                    //verificar formato FECHAS en DataBase
                    case 'DateWithinPrevMonth':
                        if(!empty($where))
                            $where = $where . ' AND ';
                        $where = $where ." ('". date('Y-m-d') ."' <= ". $c->col ." AND ". $c->col ." < '". date('Y-m-d',strtotime('+1 month')) ."')";
                        break;
                    //verificar formato FECHAS en DataBase
                    case 'DateWithinPrevMonth':
                        if(!empty($where))
                            $where = $where . ' AND ';
                        $where = $where ." ('". date('Y-m-d',strtotime('-1 month')) ."' <= ". $c->col .' AND '. $c->col ." < '". date('Y-m-d') ."')";
                        break;
                    //verificar formato FECHAS en DataBase
                    case 'DateWithinThisYear':
                        if(!empty($where))
                            $where = $where . ' AND ';
                        $where = $where ." ('". date('Y-m-d', strtotime('first day of january this year')) ."' <= ". $c->col ." AND ". $c->col ." < '". date('Y-m-d') ."')";
                        break;
                    //verificar formato FECHAS en DataBase
                    case 'DateWithinPrevYear':
                        if(!empty($where))
                            $where = $where . ' AND ';
                        $where = $where ." ('". date('Y-m-d',strtotime('-1 year')) ."' <= ". $c->col ." AND ". $c->col ." < '". date('Y-m-d') ."')";
                        break;
                    //verificar formato FECHAS en DataBase
                    case 'DateBeforePrecise':
                        if(!empty($where))
                            $where = $where . ' AND ';
                        $where = $where ." (".$c->col ." < '". date('Y-m-d') ."')";
                        break;
                    //verificar formato FECHAS en DataBase
                    case 'DateAfterPrecise':
                        if(!empty($where))
                            $where = $where . ' AND ';
                        $where = $where ." (".$c->col ." >= '". date('Y-m-d') ."')";
                        break;
                    //verificar formato FECHAS en DataBase
                    case 'DatePeriodPrecise':
                        if(!empty($where))
                            $where = $where . ' AND ';
                        $where = $where ." (".$c->col ." BETWEEN '". explode('::', $c->value)[0] ."' AND '".explode('::', $c->value)[1] ."')";
                        break;
                    //falta programar, crear los valores
                    case 'TimeBeforePrecise':
                        break;
                    //falta programar, crear los valores
                    case 'TimeAfterPrecise':
                    break;
                    //falta programar, crear los valores
                    case 'TimePeriodPrecise':
                        break;
                    //falta programar, crear los valores
                    //verificar formato FECHAS en DataBase
                    case 'MaximumOfAttr':
                        if(!empty($where))
                            $where = $where . ' AND ';
                        $where = $where ." (".$c->col ." = (SELECT MAX(". $c->value . ") FROM ". explode('.', $c->value)[0] ."))";
                        break;
                }
        }
    }

    if(!empty($orderBy))
       $orderBy = ' ORDER BY '.$orderBy;

    if(sizeof($colums) > 1 && $isGroupBy)
        $groupBy = ' GROUP BY '.$groupBy;
    else
        $groupBy = '';

    if(!empty($where))
        $where = ' WHERE '.$where;

    $query = 'SELECT '. $select .' FROM '. $from . $where . $groupBy .$orderBy;  //' WHERE '. $where .' '. $orderBy;

    return $query;
}

/*Verificar
 -TRUE - FALSE en DataBase 0 or 1, True or False
 -Formato FECHAS en DataBase "Y/m/d", "Y.m.d", "Y-m-d"
*/
/*Falta
 -InSubQuery: falta programar, crear los valores
 -NotInSubQuery: falta programar, crear los valores
*/