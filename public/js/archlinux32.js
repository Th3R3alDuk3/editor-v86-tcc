"use strict";

var _parrot = document.getElementById("parrot"); 
var _select = document.getElementById("select");  
var _button = document.getElementById("button");

/* 
 * V86 EMULATOR
 * https://github.com/Th3R3alDuk3/v86
 * 
 * Changes: 
 * SerialAdapterXtermJS
 * serial0_send_line
 */

var answer = confirm("Download image using an asynchronous connection?");

var parrot = new V86Starter({        
    wasm_path: "../wasm/v86.wasm",
    memory_size: 512 * 1024 * 1024,
    bios: {
        url: "../assets/bios/seabios.bin",
        size: 128 * 1024,
        async: false
    },
    hda: {
        url: "../assets/images/archlinux32.raw",
        async: answer
    },
    serial_container_xtermjs: _parrot,
    autostart: true,
    boot_order: 0x132
});
    
/**/

new Promise(function(resolve, reject) { 

    setTimeout(function() {
        reject(new Error("v86 timeout"));
    }, 300 * 1000);

    /**/

    var line = "";

    parrot.add_listener("serial0-output-char", function listener(char) {

        if (char === "\n") {
            line = "";
        } else {
            
            line += char;

            if (line.endsWith("[root@archlinux32 ~]#")) { 
                parrot.remove_listener("serial0-output-char", listener); 
                parrot.serial0_send_line("clear");
                resolve();
            }

        }            

    });

}).then(function() {
    _button.disabled = false;      
});

/**/     

_button.onclick = function() {

    parrot.serial0_send_line("cat << 'EOF' > ./out") 
    parrot.serial0_send_line(window.editor.getValue())
    parrot.serial0_send_line("EOF");

    parrot.serial0_send_line("clear");

    /**/
    
    switch(_select.selectedIndex) {

        case 0: // tcc            
            parrot.serial0_send_line("tcc -run ./out");
            break;

        case 1: // gcc     
            parrot.serial0_send_line("mv -f ./out ./out.c");
            parrot.serial0_send_line("gcc ./out.c -o ./out; ./out");
            break;

        case 2: // python
            parrot.serial0_send_line("python ./out");
            break;

        default:
            console.log("language not supported");

    }
    
}