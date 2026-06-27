import sys

def parse_file(filename):
    with open(filename, 'r') as f:
        text = f.read()

    i = 0
    in_s_string = False
    in_d_string = False
    in_t_string = False
    in_s_comment = False
    in_m_comment = False
    
    stack = []
    line_num = 1
    
    while i < len(text):
        c = text[i]
        
        if c == '\n':
            line_num += 1
            if in_s_comment:
                in_s_comment = False
                
        if not (in_s_string or in_d_string or in_t_string or in_s_comment or in_m_comment):
            # Regex heuristics (very basic)
            # We assume '/' is regex if it follows an operator or (, =, [, ,, etc.
            # But let's just stick to braces for now and hope there are no braces in regexes that aren't escaped.
            
            if c == '/' and i+1 < len(text) and text[i+1] == '/':
                in_s_comment = True
                i += 1
            elif c == '/' and i+1 < len(text) and text[i+1] == '*':
                in_m_comment = True
                i += 1
            elif c == "'":
                in_s_string = True
            elif c == '"':
                in_d_string = True
            elif c == '`':
                in_t_string = True
            elif c == '{':
                stack.append(('{', line_num))
            elif c == '}':
                if stack and stack[-1][0] == '{':
                    stack.pop()
                else:
                    print(f"Unmatched }} at line {line_num}")
            elif c == '(':
                stack.append(('(', line_num))
            elif c == ')':
                if stack and stack[-1][0] == '(':
                    stack.pop()
                else:
                    print(f"Unmatched ) at line {line_num}")
            elif c == '[':
                stack.append(('[', line_num))
            elif c == ']':
                if stack and stack[-1][0] == '[':
                    stack.pop()
                else:
                    print(f"Unmatched ] at line {line_num}")
        else:
            if in_s_comment:
                pass
            elif in_m_comment:
                if c == '*' and i+1 < len(text) and text[i+1] == '/':
                    in_m_comment = False
                    i += 1
            elif in_s_string:
                if c == '\\':
                    i += 1
                elif c == "'":
                    in_s_string = False
            elif in_d_string:
                if c == '\\':
                    i += 1
                elif c == '"':
                    in_d_string = False
            elif in_t_string:
                if c == '\\':
                    i += 1
                elif c == '`':
                    in_t_string = False
        i += 1

    for s in stack:
        print(f"Unclosed {s[0]} at line {s[1]}")

parse_file('index.js')
