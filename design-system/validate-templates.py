import json, re, pathlib, sys
def schema_of(t):
    p = pathlib.Path(f'sections/{t}.liquid')
    if not p.exists(): return 'MISSING'
    m = re.search(r'{% schema %}(.*?){% endschema %}', p.read_text(), re.S)
    # sin bloque schema = seccion estatica valida, no hay ajustes que validar
    return json.loads(m.group(1)) if m else {}
def check(defn,key,val,ctx,out):
    t=defn.get('type')
    if t in ('select','radio'):
        opts=[str(o['value']) for o in defn.get('options',[])]
        if str(val) not in opts: out.append(f"{ctx} {key}={val!r} invalido -> {opts}")
    elif t=='range':
        lo,hi,st=defn['min'],defn['max'],defn.get('step',1)
        if not (lo<=val<=hi): out.append(f"{ctx} {key}={val} fuera de [{lo},{hi}]")
        elif round((val-lo)/st,6)%1!=0: out.append(f"{ctx} {key}={val} no cae en step {st}")
out=[]
files = sorted(pathlib.Path('templates').glob('*.json')) + [pathlib.Path('sections/header-group.json'), pathlib.Path('sections/footer-group.json')]
for f in files:
    g=json.load(open(f))
    for sid,sec in (g.get('sections') or {}).items():
        sch=schema_of(sec['type'])
        if sch == 'MISSING': out.append(f"[{f.name}:{sid}] seccion inexistente {sec['type']}"); continue
        sd={s['id']:s for s in sch.get('settings',[]) if s.get('id')}
        bd={b['type']:{s['id']:s for s in b.get('settings',[]) if s.get('id')} for b in sch.get('blocks',[])}
        for k,v in sec.get('settings',{}).items():
            if k not in sd: out.append(f"[{f.name}:{sid}] setting desconocido {k}")
            else: check(sd[k],k,v,f"[{f.name}:{sid}]",out)
        for bid,blk in sec.get('blocks',{}).items():
            if blk['type'] not in bd: out.append(f"[{f.name}:{sid}] bloque desconocido {blk['type']}"); continue
            for k,v in blk.get('settings',{}).items():
                if k not in bd[blk['type']]: out.append(f"[{f.name}:{sid}#{blk['type']}] setting desconocido {k} (validos: {sorted(bd[blk['type']])})")
                else: check(bd[blk['type']][k],k,v,f"[{f.name}:{sid}#{blk['type']}]",out)
print("PROBLEMAS:" if out else "OK: todas las plantillas y groups validan")
for p in out: print("  -",p)
sys.exit(1 if out else 0)
