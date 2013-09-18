## Needs to be run in the db folder of the po installation

import sys
import os
import codecs


def ensure_dir(f):
    d = os.path.dirname(f)
    if not os.path.exists(d):
        os.makedirs(d)


def convert_line(line):
    lines = line.strip().split(' ', 1)

    if len(lines) > 1:
        if lines[1][0].isdigit():
            lines[1] = ",".join(lines[1].split(' '))
            if lines[1].find(",") != -1:
                lines[1] = "[" + lines[1] + "]"
        else:
            lines[1] = '"'+lines[1]+'"'
    else:
        lines.append('true')

    return '{' + lines[0] + ':'+lines[1]+'},\n'


def deal_with_file(path, gen="0", file="", type="pokes"):
    print ("gen: " + gen + ", file: " + file)
    if gen == "0":
        path2 = "/" + type  + "/" + file
    else:
        path2 = "/" + type + "/" + gen + "G/" + file

    try:
        all_moves_f = open(path + path2 + ".txt", "r");
        all_moves = all_moves_f.readlines()
        all_moves_f.close()
    except IOError:
        return

    if all_moves[0].startswith(codecs.BOM_UTF8):
        all_moves[0] = all_moves[0][3:]

    all_moves = [convert_line(x) for x in all_moves]

    output_name = "../js/db/"+ path2 + ".js";
    ensure_dir(output_name)

    print ("writing into " + output_name)
    output = open(output_name, "w");

    output.write("pokedex." + type + "." + file);
    if gen != "0":
        output.write("[" + gen + "]")
    output.write(" = {\n")
    output.writelines(all_moves)
    output.write("};")

    output.close()

def main(argv):
    path = ""
    if len(argv) <= 1:
        print ("format: ./db_converter po_db_folder")
        print ("input the po_db_folder: ")
        path = sys.stdin.readline().strip()
    else:
        path = argv[1]

    types = {
        'moves': {
            'files': ['accuracy', 'effect', 'damage_class', 'power', 'pp', 'type'],
            'base_files': ['moves', 'move_message']
        },
        'abilities': {
            'base_files': ['abilities', 'ability_desc', 'ability_messages']
        },
        'items': {
            'base_files': ['items', 'berries']
        }
    }
    gens = ['1','2','3','4','5']

    for type in types.keys():
        for gen in gens:
            try:
                for file in types[type]["files"]:
                    deal_with_file(path, gen=gen, type=type, file=file)
            except KeyError:
                pass

        try:
            for file in types[type]["base_files"]:
                deal_with_file(path, type=type, file=file)
        except KeyError:
            pass

if __name__ == "__main__":
    main(sys.argv)
