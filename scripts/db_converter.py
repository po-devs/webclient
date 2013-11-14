## Needs to be run in the db folder of the po installation

import sys
import os
import codecs


def ensure_dir(f):
    d = os.path.dirname(f)
    if not os.path.exists(d):
        os.makedirs(d)


def convert_line(line, duplicates):
    lines = line.strip().split(' ', 1)

    if duplicates != False:
        if not line in duplicates:
            duplicates.append(line)
        else:
            return ''

    if lines[0].find(':') != -1:
        nums = lines[0].split(':')
        lines[0] = str(int(nums[0]) + int(nums[1])*65536)

    if len(lines) > 1:
        if lines[1][0].isdigit() and (len(lines[1]) == 1 or lines[1][1].isdigit()) :
            lines[1] = ",".join(lines[1].split(' '))
            if lines[1].find(",") != -1:
                lines[1] = "[" + lines[1] + "]"
        else:
            lines[1] = '"'+lines[1].replace("\"", "\\\"") +'"'
    else:
        lines.append('true')

    return lines[0] + ':'+lines[1]+',\n'


def deal_with_file(path, gen="0", file="", type="pokes", duplicates=False):
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

    all_moves = [convert_line(x, duplicates) for x in all_moves]

    output_name = "../js/db/"+ path2 + ".js";
    ensure_dir(output_name)

    print ("writing into " + output_name)
    output = open(output_name, "wb");

    typepath = "pokedex."+type
    filepath = typepath+"."+file
    output.write("if(!"+typepath+")"+typepath+"={};\n")
    if gen != "0":
        output.write("if(!"+filepath+")"+filepath+"=[];\n")
    output.write(filepath);
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
            'unique_files': ['released_items', 'released_berries'],
            'base_files': ['items', 'berries', 'item_useful', 'item_messages', 'berry_messages']
        },
        'types': {
            'base_files': ["types", "category"]
        },
        'categories': {
            'base_files': ['categories']
        },
        'natures': {
            'base_files': ['nature']
        },
        'status': {
            'base_files': ['stats', 'status']
        },
        'genders': {
            'base_files': ['genders']
        },
        'gens': {
            'base_files': ['versions', 'gens']
        }
    }
    gens = ['6', '5', '4', '3', '2', '1']
    duplicates = {}

    for type in types.keys():
        for gen in gens:
            if 'files' in types[type]:
                for file in types[type]["files"]:
                    if not file in duplicates:
                        duplicates[file] = []
                    deal_with_file(path, gen=gen, type=type, file=file, duplicates=duplicates[file])
            if 'unique_files' in types[type]:
                for file in types[type]["unique_files"]:
                    deal_with_file(path, gen=gen, type=type, file=file)
        if 'base_files' in types[type]:
            for file in types[type]["base_files"]:
                deal_with_file(path, type=type, file=file)

if __name__ == "__main__":
    main(sys.argv)
