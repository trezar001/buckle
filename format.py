new = []
tab = 0
with open('file.txt', 'r') as f:
    for li in f.readlines():

        li = li.lstrip()
        noTab = False
        print(len(li))
        if len(li) == 0:
            noTab = True

        li = li.replace('\n', '\\n')
        li = li.replace('"', '\\"')
        li = li.lstrip()

        i = 0
        if ('</' in li or '}' in li) and ',' not in li and '{' not in li and '<a ' and '</a' not in li and '</span' not in li and '</p' not in li and '<span ' not in li and '<h' not in li and '<i' not in li and '<legend' not in li and '<label' not in li and '<input' not in li and '<button' not in li and '<option' not in li and '<th' not in li and '<td' not in li and '<p ' not in li and '<time' not in li and '<br' not in li and '<strong' not in li:
            tab = tab - 1

        while i < tab:
            li = '\\t' + li
            i = i + 1


        if noTab == True:
            pass
        elif ('</' in li or '}' in li) and '<a ' not in li and '</button' not in li:
            pass
        elif ',' not in li and '<a ' not in li and '<span ' not in li and '<h' not in li and '<i' not in li and '<legend' not in li and '<label' not in li and '<input' not in li  and '<button' not in li and '<option' not in li and '*/' not in li and ';' not in li and '<p ' not in li and '<time' not in li and '<br' not in li and '<strong' not in li:
            tab = tab + 1
        print(li)
        if(noTab == False):
            new.append(li)
        else:
            new.append('\\n')
    

value = ''.join(new)
with open('file.txt', 'w') as f:
    f.write('\"code\": \"' + value + '\"')