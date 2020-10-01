new = []
tab = 0
with open('file.txt', 'r') as f:
    for li in f.readlines():
        li = li.replace('\n', '\\n')
        li = li.replace('"', '\\"')
        li = li.lstrip()

        i = 0
        if '</' in li and '<a' not in li and '<span' not in li and '<h' not in li and '<i' not in li:
            tab = tab - 1

        while i < tab:
            li = '\\t' + li
            i = i + 1

        if '</' in li and '<a' not in li :
            pass
        elif '</a>' not in li:
            tab = tab + 1
        print(li)
        new.append(li)
    

value = ''.join(new)
with open('file.txt', 'w') as f:
    f.write('\"code\": \"' + value + '\"')