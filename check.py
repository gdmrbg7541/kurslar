import sys

def check_brackets(filename):
    with open(filename, 'r') as f:
        text = f.read()

    stack = []
    lines = text.split('\n')
    
    in_string = False
    string_char = ''
    in_comment = False
    in_regex = False
    
    for i, line in enumerate(lines):
        j = 0
        while j < len(line):
            c = line[j]
            
            # Simple parsing (might be flawed with complex escapes, but good enough)
            if in_string:
                if c == '\\':
                    j += 1
                elif c == string_char:
                    in_string = False
            else:
                if c in ['\"', '\'', '`']:
                    in_string = True
                    string_char = c
                elif c == '{':
                    stack.append(('{', i+1))
                elif c == '}':
                    if stack and stack[-1][0] == '{':
                        stack.pop()
                    else:
                        print(f'Unmatched }} at line {i+1}')
                elif c == '(':
                    stack.append(('(', i+1))
                elif c == ')':
                    if stack and stack[-1][0] == '(':
                        stack.pop()
                    else:
                        print(f'Unmatched ) at line {i+1}')
                elif c == '[':
                    stack.append(('[', i+1))
                elif c == ']':
                    if stack and stack[-1][0] == '[':
                        stack.pop()
                    else:
                        print(f'Unmatched ] at line {i+1}')
            j += 1

    if in_string:
        print(f'Unclosed string literal starting with {string_char}')
    if stack:
        print(f'Unclosed brackets: {stack}')
    else:
        print('All brackets closed!')

check_brackets('index.js')
