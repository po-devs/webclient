/* This file is to be able to test the battle engine without connecting to a server */

$(function() {
    /* Switch off the registry */
    $(".page").toggle();

    var f = function() {
        battles.watchBattle(1, {"clauses":449,"gen":{"num":6,"subnum":0},"mode":0,"players":[806259,806274],"rated":true});

        var beginning = [
            {"command":"tier","tier":"XY OU"},
            {"command":"rated","rated":true},
            {"command":"spectatorjoin","id":802670,"name":"Yyum"},
            {"command":"spectatorjoin","id":806347,"name":"coyotte508"},
            {"command":"blank"},
            {"command":"teamstatus","player":0,"slot":0,"status":4},
            {"command":"teamstatus","player":0,"slot":1,"status":0},
            {"command":"teamstatus","player":0,"slot":2,"status":0},
            {"command":"teamstatus","player":0,"slot":3,"status":0},
            {"command":"teamstatus","player":0,"slot":4,"status":0},
            {"command":"teamstatus","player":0,"slot":5,"status":0},
            {"command":"send","pokemon":{"gender":1,"level":100,"name":"Latios","num":381,"percent":72,"status":4},"silent":true,"slot":0,"spot":0},

            {"command":"teamstatus","player":1,"slot":0,"status":0},
            {"command":"teamstatus","player":1,"slot":1,"status":0},
            {"command":"teamstatus","player":1,"slot":2,"status":0},
            {"command":"teamstatus","player":1,"slot":3,"status":0},
            {"command":"teamstatus","player":1,"slot":4,"status":0},
            {"command":"teamstatus","player":1,"slot":5,"status":0},
            {"command":"send","pokemon":{"gender":1,"level":100,"name":"Goodra","num":706,"percent":38},"silent":true,"slot":0,"spot":1}
        ];

        for (var i in beginning) {
            battles.battle(1).dealWithCommand(beginning[i]);
        }
    };

    setTimeout(f, 1000);

    /* Function to call directly in the browser console, using commands. */
    bc = function(command) {
        battles.battle(1).dealWithCommand(command);
    };

    /* Sample commands:
     {"command":"clock","player":0,"status":"stopped","time":300}
     {"command":"clock","player":1,"status":"stopped","time":284}
     {"command":"turn","turn":3}
     {"command":"sendback","silent":false,"spot":1}

     {"command":"send","pokemon":{"gender":1,"level":100,"name":"Azumarill","num":184,"percent":100},"silent":false,"slot":1,"spot":1}
     {"command":"blank"}
     {"command":"move","move":473,"silent":false,"spot":0}
     {"command":"effectiveness","effectiveness":4,"spot":1}
     {"command":"damage","damage":62,"spot":1}
     {"command":"hpchange","newHP":37,"spot":1}
     {"command":"blank"}
     {"berry":0,"command":"itemmessage","foe":0,"item":12,"other":0,"part":0,"spot":1}
     {"command":"hpchange","newHP":43,"spot":1}
     {"command":"statusdamage","spot":0,"status":4}
     {"command":"hpchange","newHP":60,"spot":0}
     {"command":"choiceselection","spot":0}
     {"command":"choiceselection","spot":1}
     {"command":"send","pokemon":{"gender":1,"level":100,"name":"Azumarill","num":184,"percent":100},"silent":false,"slot":1,"spot":1}
     {"command":"blank"}
     {"command":"move","move":473,"silent":false,"spot":0}
     {"command":"effectiveness","effectiveness":4,"spot":1}
     {"command":"damage","damage":62,"spot":1}
     {"command":"hpchange","newHP":37,"spot":1}
     {"command":"blank"}
     {"berry":0,"command":"itemmessage","foe":0,"item":12,"other":0,"part":0,"spot":1}
     {"command":"hpchange","newHP":43,"spot":1}
     {"command":"statusdamage","spot":0,"status":4}
     {"command":"hpchange","newHP":60,"spot":0}
     {"command":"choiceselection","spot":0}
     {"command":"choiceselection","spot":1}
     {"command":"clock","player":0,"status":"stopped","time":300}
     {"command":"clock","player":1,"status":"stopped","time":282}
     {"command":"turn","turn":4}
     {"command":"sendback","silent":false,"spot":1}
     {"command":"send","pokemon":{"gender":1,"level":100,"name":"Avalugg","num":713,"percent":100},"silent":false,"slot":2,"spot":1}
     {"command":"blank"}
     {"command":"move","move":473,"silent":false,"spot":0}
     {"command":"effectiveness","effectiveness":4,"spot":1}
     {"command":"critical","spot":1}
     {"command":"damage","damage":47,"spot":1}
     {"command":"hpchange","newHP":52,"spot":1}
     {"command":"blank"}
     {"berry":0,"command":"itemmessage","foe":0,"item":12,"other":0,"part":0,"spot":1}
     {"command":"hpchange","newHP":58,"spot":1}
     {"command":"statusdamage","spot":0,"status":4}
     {"command":"hpchange","newHP":47,"spot":0}
     {"command":"choiceselection","spot":0}
     {"command":"choiceselection","spot":1}
     {"command":"send","pokemon":{"gender":1,"level":100,"name":"Avalugg","num":713,"percent":100},"silent":false,"slot":2,"spot":1}
     {"command":"blank"}
     {"command":"move","move":473,"silent":false,"spot":0}
     {"command":"effectiveness","effectiveness":4,"spot":1}
     {"command":"critical","spot":1}
     {"command":"damage","damage":47,"spot":1}
     {"command":"hpchange","newHP":52,"spot":1}
     {"command":"blank"}
     {"berry":0,"command":"itemmessage","foe":0,"item":12,"other":0,"part":0,"spot":1}
     {"command":"hpchange","newHP":58,"spot":1}
     {"command":"statusdamage","spot":0,"status":4}
     {"command":"hpchange","newHP":47,"spot":0}
     {"command":"choiceselection","spot":0}
     {"command":"choiceselection","spot":1}
     {"command":"clock","player":0,"status":"stopped","time":297}
     {"command":"clock","player":1,"status":"stopped","time":291}
     {"command":"turn","turn":5}
     {"command":"sendback","silent":false,"spot":0}
     {"command":"send","pokemon":{"level":100,"name":"Genesect","num":649,"percent":81,"shiny":true},"silent":false,"slot":4,"spot":0}
     {"command":"blank"}
     {"ability":13,"command":"abilitymessage","foe":0,"other":0,"part":0,"spot":0,"type":0}
     {"boost":1,"command":"boost","silent":false,"spot":0,"stat":3}
     {"command":"move","move":105,"silent":false,"spot":1}
     {"command":"movemessage","data":"","foe":0,"move":60,"other":0,"part":0,"spot":1,"type":0}
     {"command":"hpchange","newHP":100,"spot":1}
     {"command":"blank"}
     {"command":"choiceselection","spot":0}
     {"command":"choiceselection","spot":1}
     {"command":"send","pokemon":{"level":100,"name":"Genesect","num":649,"percent":81,"shiny":true},"silent":false,"slot":4,"spot":0}
     {"command":"blank"}
     {"ability":13,"command":"abilitymessage","foe":0,"other":0,"part":0,"spot":0,"type":0}
     {"boost":1,"command":"boost","silent":false,"spot":0,"stat":3}
     {"command":"move","move":105,"silent":false,"spot":1}
     {"command":"movemessage","data":"","foe":0,"move":60,"other":0,"part":0,"spot":1,"type":0}
     {"command":"hpchange","newHP":100,"spot":1}
     {"command":"blank"}
     {"command":"choiceselection","spot":0}
     {"command":"choiceselection","spot":1}
     {"command":"clock","player":0,"status":"stopped","time":300}
     {"command":"clock","player":1,"status":"stopped","time":285}
     {"command":"turn","turn":6}
     {"command":"move","move":53,"silent":false,"spot":0}
     {"command":"effectiveness","effectiveness":8,"spot":1}
     {"command":"hpchange","newHP":0,"spot":1}
     {"command":"damage","damage":100,"spot":1}
     {"command":"status","multiple":false,"silent":false,"spot":1,"status":31}
     {"command":"teamstatus","player":1,"slot":0,"status":31}
     {"command":"ko","spot":1}
     {"command":"blank"}
     {"command":"blank"}
     {"command":"choiceselection","spot":1}
     {"command":"effectiveness","effectiveness":8,"spot":1}
     {"command":"hpchange","newHP":0,"spot":1}
     {"command":"damage","damage":100,"spot":1}
     {"command":"status","multiple":false,"silent":false,"spot":1,"status":31}
     {"command":"teamstatus","player":1,"slot":0,"status":31}
     {"command":"ko","spot":1}
     {"command":"blank"}
     {"command":"blank"}
     {"command":"choiceselection","spot":1}
     {"command":"clock","player":1,"status":"stopped","time":290}
     {"command":"send","pokemon":{"gender":1,"level":100,"name":"Diggersby","num":660,"percent":100},"silent":false,"slot":3,"spot":1}
     {"command":"blank"}
     {"command":"choiceselection","spot":0}
     {"command":"choiceselection","spot":1}
     {"command":"blank"}
     {"command":"choiceselection","spot":0}
     {"command":"choiceselection","spot":1}
     {"command":"clock","player":0,"status":"stopped","time":300}
     {"command":"clock","player":1,"status":"stopped","time":300}
     {"command":"turn","turn":7}
     {"command":"sendback","silent":false,"spot":0}
     {"command":"send","pokemon":{"forme":1,"gender":1,"level":100,"name":"Landorus","num":645,"percent":100},"silent":false,"slot":3,"spot":0}
     {"command":"blank"}
     {"ability":34,"command":"abilitymessage","foe":1,"other":0,"part":0,"spot":0,"type":0}
     {"boost":-1,"command":"boost","silent":false,"spot":1,"stat":1}
     {"command":"move","move":369,"silent":false,"spot":1}
     {"command":"effectiveness","effectiveness":2,"spot":0}
     {"command":"damage","damage":15,"spot":0}
     {"command":"hpchange","newHP":84,"spot":0}
     {"command":"choiceselection","spot":1}
     {"command":"send","pokemon":{"forme":1,"gender":1,"level":100,"name":"Landorus","num":645,"percent":100},"silent":false,"slot":3,"spot":0}
     {"command":"blank"}
     {"ability":34,"command":"abilitymessage","foe":1,"other":0,"part":0,"spot":0,"type":0}
     {"boost":-1,"command":"boost","silent":false,"spot":1,"stat":1}
     {"command":"move","move":369,"silent":false,"spot":1}
     {"command":"effectiveness","effectiveness":2,"spot":0}
     {"command":"damage","damage":15,"spot":0}
     {"command":"hpchange","newHP":84,"spot":0}
     {"command":"choiceselection","spot":1}
     {"command":"clock","player":1,"status":"stopped","time":300}
     {"command":"sendback","silent":false,"spot":1}
     {"command":"send","pokemon":{"gender":1,"level":100,"name":"Goodra","num":706,"percent":38},"silent":false,"slot":1,"spot":1}
     {"command":"blank"}
     {"command":"blank"}
     {"command":"choiceselection","spot":0}
     {"command":"choiceselection","spot":1}
     {"command":"send","pokemon":{"gender":1,"level":100,"name":"Goodra","num":706,"percent":38},"silent":false,"slot":1,"spot":1}
     {"command":"blank"}
     {"command":"blank"}
     {"command":"choiceselection","spot":0}
     {"command":"choiceselection","spot":1}
     {"command":"clock","player":0,"status":"stopped","time":300}
     {"command":"clock","player":1,"status":"stopped","time":300}
     {"command":"turn","turn":8}
     {"command":"move","move":89,"silent":false,"spot":0}
     {"command":"effectiveness","effectiveness":4,"spot":1}
     {"command":"hpchange","newHP":0,"spot":1}
     {"command":"damage","damage":38,"spot":1}
     {"command":"status","multiple":false,"silent":false,"spot":1,"status":31}
     {"command":"teamstatus","player":1,"slot":0,"status":31}
     {"command":"ko","spot":1}
     {"command":"blank"}
     {"command":"blank"}
     {"command":"choiceselection","spot":1}
     {"command":"effectiveness","effectiveness":4,"spot":1}
     {"command":"hpchange","newHP":0,"spot":1}
     {"command":"damage","damage":38,"spot":1}
     {"command":"status","multiple":false,"silent":false,"spot":1,"status":31}
     {"command":"teamstatus","player":1,"slot":0,"status":31}
     {"command":"ko","spot":1}
     */
});