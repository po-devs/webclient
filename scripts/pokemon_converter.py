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
    nums = lines[0].split(':')
    if len(lines) > 1:
        lines[1] = ",".join(lines[1].split(' '))
    else:
        lines.append('true')
    lines[0] = str(int(nums[0]) + int(nums[1])*65536)
    return '{' + lines[0] + ':'+lines[1]+'},\n'


def main(argv):
    path = ""
    if len(argv) <= 1:
        print ("format: ./pokemon_converter po_db_folder")
        print ("input the po_db_folder: ")
        path = sys.stdin.readline().strip()
    else:
        path = argv[1]

    gens = ['1','2','3','4','5']
    files = ['all_moves', 'type1', 'type2', 'ability1', 'ability2', 'ability3', 'min_levels', 'released']

    for gen in gens:
        for file in files:
            print ("gen: " + gen + ", file: " + file)
            try:
                all_moves_f = open(path+"/pokes/"+ gen + "G/" + file + ".txt", "r");
                all_moves = all_moves_f.readlines()
                all_moves_f.close()
            except IOError:
                continue

            if all_moves[0].startswith(codecs.BOM_UTF8):
                all_moves[0] = all_moves[0][3:]

            all_moves = [convert_line(x) for x in all_moves]

            output_name = "converted/"+"/pokes/"+ gen + "G/" + file + ".json";
            ensure_dir(output_name)

            print ("writing into " + output_name)
            output = open(output_name, "w");

            output.write("pokedex.pokes." + file + "[" + gen + "] = {\n")
            output.writelines(all_moves)
            output.write("};")

            output.close()

if __name__ == "__main__":
    main(sys.argv)
