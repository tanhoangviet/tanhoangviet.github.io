"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

// BetterCodeBlocks v1.0.1 - Fixed CommonJS bundle for Kettu / Bunny

const _v         = typeof vendetta !== "undefined" ? vendetta : (typeof bunny !== "undefined" ? bunny : {});
const _metro     = _v?.metro ?? {};
const _common    = _metro?.common ?? {};
const React      = _common?.React ?? globalThis.React;
const RN         = _common?.ReactNative ?? globalThis.ReactNative;
const findByProps  = _metro?.findByProps ?? (() => null);
const findByName   = _metro?.findByName  ?? (() => null);
const patchAfter   = _v?.patcher?.after  ?? (() => () => {});
const showToast    = _v?.ui?.toasts?.showToast ?? (() => {});

const { View, Text, TouchableOpacity, ScrollView, StyleSheet, Modal, SafeAreaView, ActivityIndicator, Linking } = RN ?? {};

const T = {
  bg:"#1E1E2E",bgSurf:"#181825",bgOver:"#313244",border:"#45475A",
  plain:"#CDD6F4",keyword:"#CBA6F7",string:"#A6E3A1",comment:"#585B70",
  number:"#FAB387",fn:"#89B4FA",type:"#F9E2AF",op:"#89DCEB",
  punct:"#BAC2DE",accent:"#89B4FA",success:"#A6E3A1",muted:"#6C7086",white:"#CDD6F4",
};

const RULES = {
  lua:[
    [/^--\[\[[\s\S]*?\]\]/,"comment"],[/^--[^\n]*/,"comment"],
    [/^"(?:[^"\\]|\\.)*"|^'(?:[^'\\]|\\.)*'/,"string"],
    [/^\b(and|break|do|else|elseif|end|false|for|function|goto|if|in|local|nil|not|or|repeat|return|then|true|until|while)\b/,"keyword"],
    [/^\b0x[\da-fA-F]+\b|^\b\d+\.?\d*\b/,"number"],
    [/^\b[A-Z][A-Z0-9_]*\b/,"type"],[/^\b[a-zA-Z_]\w*(?=\s*\()/,"fn"],
    [/^[+\-*/%^#&|~<>=]/,"op"],[/^[{}[\]();:.]/,"punct"],
  ],
  python:[
    [/^"""[\s\S]*?"""|^'''[\s\S]*?'''/,"string"],[/^#[^\n]*/,"comment"],
    [/^f?"(?:[^"\\]|\\.)*"|^f?'(?:[^'\\]|\\.)*'/,"string"],
    [/^\b(False|None|True|and|as|assert|async|await|break|class|continue|def|del|elif|else|except|finally|for|from|global|if|import|in|is|lambda|nonlocal|not|or|pass|raise|return|try|while|with|yield)\b/,"keyword"],
    [/^\b\d+\.?\d*\b/,"number"],[/^\b[A-Z][a-zA-Z0-9_]*\b/,"type"],
    [/^\b[a-zA-Z_]\w*(?=\s*\()/,"fn"],[/^[+\-*/%@&|^~<>=!]/,"op"],[/^[{}[\]();:.]/,"punct"],
  ],
  javascript:[
    [/^\/\*[\s\S]*?\*\//,"comment"],[/^\/\/[^\n]*/,"comment"],
    [/^`[\s\S]*?`|^"(?:[^"\\]|\\.)*"|^'(?:[^'\\]|\\.)*'/,"string"],
    [/^\b(break|case|catch|class|const|continue|default|delete|do|else|export|extends|finally|for|from|function|if|import|in|instanceof|let|new|of|return|static|super|switch|this|throw|try|typeof|var|void|while|async|await|type|interface|enum|readonly)\b/,"keyword"],
    [/^\b\d+\.?\d*\b/,"number"],[/^\b[A-Z][a-zA-Z0-9_]*\b/,"type"],
    [/^\b[a-zA-Z_]\w*(?=\s*\()/,"fn"],[/^[+\-*/%&|^~<>=!?]/,"op"],[/^[{}[\]();:.]/,"punct"],
  ],
  json:[
    [/^"(?:[^"\\]|\\.)*"(?=\s*:)/,"keyword"],[/^"(?:[^"\\]|\\.)*"/,"string"],
    [/^\b(true|false|null)\b/,"type"],[/^-?\b\d+\.?\d*\b/,"number"],[/^[{}[\]:,]/,"punct"],
  ],
  css:[
    [/^\/\*[\s\S]*?\*\//,"comment"],[/^"[^"]*"|^'[^']*'/,"string"],
    [/^#[0-9a-fA-F]{3,8}\b/,"number"],[/^\b\d+\.?\d*(px|em|rem|vh|vw|%|s|ms|deg|fr)?\b/,"number"],
    [/^[a-zA-Z-]+(?=\s*:)/,"keyword"],[/^@[a-zA-Z-]+/,"type"],
    [/^:[a-zA-Z-]+/,"fn"],[/^[{}:;,.]/,"punct"],
  ],
  html:[
    [/^<!--[\s\S]*?-->/,"comment"],[/^"[^"]*"|^'[^']*'/,"string"],
    [/^<\/?\w[\w.-]*/,"keyword"],[/^[\w-]+=/,"fn"],[/^[<>/{}]/,"punct"],
  ],
};
RULES.js=RULES.javascript;RULES.ts=RULES.javascript;RULES.typescript=RULES.javascript;
RULES.py=RULES.python;RULES.htm=RULES.html;

function tokenize(code,lang){
  const rules=RULES[(lang||"").toLowerCase()];
  if(!rules)return[{t:"plain",v:code}];
  const tokens=[];let pos=0;
  while(pos<code.length){
    let matched=false;
    for(const[re,type]of rules){
      const m=re.exec(code.slice(pos));
      if(m){tokens.push({t:type,v:m[0]});pos+=m[0].length;matched=true;break;}
    }
    if(!matched){
      const last=tokens[tokens.length-1];
      if(last&&last.t==="plain")last.v+=code[pos];
      else tokens.push({t:"plain",v:code[pos]});
      pos++;
    }
  }
  return tokens;
}

const TC={keyword:T.keyword,string:T.string,comment:T.comment,number:T.number,fn:T.fn,type:T.type,op:T.op,punct:T.punct,plain:T.plain};
const gc=(t)=>TC[t]??T.plain;
const Clip=findByProps("setString","getString")??{setString:()=>{}};
const EXT_ICON={lua:"🌙",js:"⚡",ts:"💙",py:"🐍",json:"📋",css:"🎨",html:"🌐",txt:"📄"};
const LANG_LABELS={lua:"Lua",python:"Python",py:"Python",js:"JavaScript",javascript:"JavaScript",ts:"TypeScript",typescript:"TypeScript",css:"CSS",html:"HTML",json:"JSON",bash:"Bash",sh:"Shell",txt:"Plain Text","":"Code"};
const SUPPORTED=["lua","js","ts","py","txt","json","css","html","htm"];
const fmt=(b)=>b<1024?`${b} B`:b<1048576?`${(b/1024).toFixed(1)} KB`:`${(b/1048576).toFixed(2)} MB`;

const S=StyleSheet.create({
  cw:{backgroundColor:T.bg,borderRadius:8,borderWidth:1,borderColor:T.border,overflow:"hidden",marginVertical:6},
  ch:{flexDirection:"row",justifyContent:"space-between",alignItems:"center",paddingHorizontal:12,paddingVertical:7,backgroundColor:T.bgSurf,borderBottomWidth:1,borderBottomColor:T.border},
  chl:{flexDirection:"row",alignItems:"center",gap:6},
  cdot:{width:7,height:7,borderRadius:99,backgroundColor:T.accent},
  clt:{color:T.muted,fontSize:11,fontFamily:"monospace",letterSpacing:0.5},
  cc:{paddingHorizontal:10,paddingVertical:4,borderRadius:5,backgroundColor:T.bgOver,borderWidth:1,borderColor:T.border},
  ccok:{borderColor:T.success,backgroundColor:"#1e3a2a"},
  cct:{color:T.white,fontSize:11,fontFamily:"monospace"},
  ccot:{color:T.success},
  cin:{flexDirection:"row",padding:12},
  cns:{paddingRight:12,borderRightWidth:1,borderRightColor:T.border,marginRight:12,alignItems:"flex-end"},
  cn:{color:T.muted,fontFamily:"monospace",fontSize:12,lineHeight:20,minWidth:20,textAlign:"right"},
  ccode:{fontFamily:"monospace",fontSize:13,lineHeight:20,color:T.plain},
  fw:{marginVertical:2},
  fp:{flexDirection:"row",alignItems:"center",backgroundColor:T.bgSurf,borderWidth:1,borderColor:T.border,borderRadius:8,paddingHorizontal:12,paddingVertical:8,marginTop:4,gap:8},
  fn2:{color:T.white,fontFamily:"monospace",fontSize:13,flex:1},
  fb:{paddingHorizontal:10,paddingVertical:5,borderRadius:6,borderWidth:1,borderColor:T.accent,backgroundColor:"rgba(137,180,250,0.1)"},
  fbt:{color:T.accent,fontFamily:"monospace",fontSize:12},
  ms:{flex:1,backgroundColor:T.bg},
  mn:{flexDirection:"row",alignItems:"center",paddingHorizontal:12,paddingVertical:10,backgroundColor:T.bgSurf,borderBottomWidth:1,borderBottomColor:T.border,gap:10},
  mcl:{width:32,height:32,borderRadius:16,backgroundColor:T.bgOver,justifyContent:"center",alignItems:"center"},
  mct:{color:T.white,fontSize:14},
  mtw:{flex:1,flexDirection:"row",alignItems:"center",gap:8},
  mf:{color:T.white,fontSize:14,fontFamily:"monospace",fontWeight:"600"},
  mm:{color:T.muted,fontSize:11,fontFamily:"monospace",marginTop:1},
  mas:{flexDirection:"row",gap:8},
  ma:{width:34,height:34,borderRadius:8,backgroundColor:T.bgOver,borderWidth:1,borderColor:T.border,justifyContent:"center",alignItems:"center"},
  maok:{borderColor:T.success,backgroundColor:"#1e3a2a"},
  mat:{color:T.white,fontSize:16},
  maot:{color:T.success},
  tb:{flexDirection:"row",backgroundColor:T.bgSurf,borderBottomWidth:1,borderBottomColor:T.border},
  tt:{paddingHorizontal:16,paddingVertical:10,borderBottomWidth:2,borderBottomColor:"transparent"},
  tta:{borderBottomColor:T.accent},
  ttx:{color:T.muted,fontSize:13,fontFamily:"monospace"},
  ttxa:{color:T.white},
  iw:{padding:16},
  ir:{flexDirection:"row",justifyContent:"space-between",alignItems:"center",paddingVertical:10,borderBottomWidth:1,borderBottomColor:T.border},
  il:{color:T.muted,fontSize:13,fontFamily:"monospace"},
  iv:{color:T.white,fontSize:13,fontFamily:"monospace",maxWidth:"60%"},
  id:{marginTop:16,padding:12,backgroundColor:T.bgOver,borderRadius:8,borderWidth:1,borderColor:T.accent,alignItems:"center"},
  idt:{color:T.accent,fontSize:13,fontFamily:"monospace"},
});

function HText({code,lang}){
  return React.createElement(Text,{selectable:true,style:S.ccode},
    ...tokenize(code,lang).map((tok,i)=>React.createElement(Text,{key:i,style:{color:gc(tok.t),fontFamily:"monospace"}},tok.v))
  );
}

function CodeBlock({code,lang}){
  const[copied,setCopied]=React.useState(false);
  const label=LANG_LABELS[(lang||"").toLowerCase()]??(lang?lang.toUpperCase():"Code");
  const lines=(code||"").split("\n");
  return React.createElement(View,{style:S.cw},
    React.createElement(View,{style:S.ch},
      React.createElement(View,{style:S.chl},React.createElement(View,{style:S.cdot}),React.createElement(Text,{style:S.clt},label)),
      React.createElement(TouchableOpacity,{onPress:()=>{Clip.setString(code);setCopied(true);showToast("Copied ✓");setTimeout(()=>setCopied(false),2000);},style:[S.cc,copied&&S.ccok],activeOpacity:0.7},
        React.createElement(Text,{style:[S.cct,copied&&S.ccot]},copied?"✓  Copied":"⎘  Copy")
      )
    ),
    React.createElement(ScrollView,{horizontal:true,showsHorizontalScrollIndicator:false},
      React.createElement(ScrollView,{nestedScrollEnabled:true,showsVerticalScrollIndicator:true,style:{maxHeight:320}},
        React.createElement(View,{style:S.cin},
          React.createElement(View,{style:S.cns},...lines.map((_,i)=>React.createElement(Text,{key:i,style:S.cn},i+1))),
          React.createElement(HText,{code,lang:lang||""})
        )
      )
    )
  );
}

function FileModal({visible,filename,content,fileSize,downloadUrl,onClose}){
  const[tab,setTab]=React.useState("code");
  const[copied,setCopied]=React.useState(false);
  const ext=(filename.split(".").pop()??"txt").toLowerCase();
  const lines=content.split("\n");
  return React.createElement(Modal,{visible,animationType:"slide",presentationStyle:"pageSheet",onRequestClose:onClose},
    React.createElement(SafeAreaView,{style:S.ms},
      React.createElement(View,{style:S.mn},
        React.createElement(TouchableOpacity,{onPress:onClose,style:S.mcl},React.createElement(Text,{style:S.mct},"✕")),
        React.createElement(View,{style:S.mtw},
          React.createElement(Text,{style:{fontSize:20}},EXT_ICON[ext]??"📄"),
          React.createElement(View,null,
            React.createElement(Text,{style:S.mf,numberOfLines:1},filename),
            React.createElement(Text,{style:S.mm},`${fmt(fileSize)}  ·  ${lines.length} lines`)
          )
        ),
        React.createElement(View,{style:S.mas},
          React.createElement(TouchableOpacity,{onPress:()=>{Clip.setString(content);setCopied(true);setTimeout(()=>setCopied(false),2000);},style:[S.ma,copied&&S.maok],activeOpacity:0.7},
            React.createElement(Text,{style:[S.mat,copied&&S.maot]},copied?"✓":"⎘")
          ),
          downloadUrl&&React.createElement(TouchableOpacity,{onPress:()=>Linking.openURL(downloadUrl),style:S.ma,activeOpacity:0.7},React.createElement(Text,{style:S.mat},"↓"))
        )
      ),
      React.createElement(View,{style:S.tb},
        ["code","info"].map(id=>React.createElement(TouchableOpacity,{key:id,style:[S.tt,tab===id&&S.tta],onPress:()=>setTab(id)},
          React.createElement(Text,{style:[S.ttx,tab===id&&S.ttxa]},id==="code"?"📄  Code":"ℹ️  Info")
        ))
      ),
      tab==="code"
        ?React.createElement(ScrollView,{style:{flex:1},horizontal:true,showsHorizontalScrollIndicator:false},
            React.createElement(ScrollView,{nestedScrollEnabled:true,showsVerticalScrollIndicator:true},
              React.createElement(View,{style:S.cin},
                React.createElement(View,{style:S.cns},...lines.map((_,i)=>React.createElement(Text,{key:i,style:S.cn},i+1))),
                React.createElement(HText,{code:content,lang:ext})
              )
            )
          )
        :React.createElement(ScrollView,{style:{flex:1}},
            React.createElement(View,{style:S.iw},
              ...[["File name",filename],["Extension",`.${ext}`],["Size",fmt(fileSize)],["Lines",String(lines.length)]].map(([l,v])=>
                React.createElement(View,{key:l,style:S.ir},React.createElement(Text,{style:S.il},l),React.createElement(Text,{style:S.iv},v))
              ),
              downloadUrl&&React.createElement(TouchableOpacity,{style:S.id,onPress:()=>Linking.openURL(downloadUrl)},React.createElement(Text,{style:S.idt},"🔗  Open in browser"))
            )
          )
    )
  );
}

function AttachViewer({filename,url,fileSize,children}){
  const[visible,setVisible]=React.useState(false);
  const[content,setContent]=React.useState(null);
  const[loading,setLoading]=React.useState(false);
  const ext=(filename.split(".").pop()??"").toLowerCase();
  const open=async()=>{
    if(content){setVisible(true);return;}
    setLoading(true);
    try{const r=await fetch(url);setContent(await r.text());setVisible(true);}
    catch{showToast("Failed to load");}
    finally{setLoading(false);}
  };
  return React.createElement(View,{style:S.fw},children,
    React.createElement(View,{style:S.fp},
      React.createElement(Text,{style:{fontSize:16}},EXT_ICON[ext]??"📄"),
      React.createElement(Text,{style:S.fn2,numberOfLines:1},filename),
      loading?React.createElement(ActivityIndicator,{size:"small",color:T.accent})
        :React.createElement(TouchableOpacity,{onPress:open,style:S.fb,activeOpacity:0.75},React.createElement(Text,{style:S.fbt},"View Code"))
    ),
    content!=null&&React.createElement(FileModal,{visible,filename,content,fileSize,downloadUrl:url,onClose:()=>setVisible(false)})
  );
}

const patches=[];

const plugin={
  onLoad(){
    const SM=findByProps("defaultRules","parserFor");
    if(SM?.defaultRules?.codeBlock){
      const orig=SM.defaultRules.codeBlock.react;
      SM.defaultRules.codeBlock.react=(node,output,state)=>
        React.createElement(CodeBlock,{key:state?.key??Math.random().toString(),code:node.content??"",lang:node.lang??""});
      patches.push(()=>{SM.defaultRules.codeBlock.react=orig;});
    }
    const AC=findByName("Attachment")??findByName("FileAttachment");
    if(AC){
      const up=patchAfter("default",AC,(args,res)=>{
        if(!res)return res;
        try{
          const p=args[0];
          const fn=p?.filename??p?.name??"";
          const ext=(fn.split(".").pop()??"").toLowerCase();
          if(!SUPPORTED.includes(ext))return res;
          return React.createElement(AttachViewer,{filename:fn,url:p?.url??p?.proxy_url??"",fileSize:p?.size??0,children:res});
        }catch{return res;}
      });
      patches.push(up);
    }
    showToast("BetterCodeBlocks ✓");
  },
  onUnload(){
    patches.forEach(u=>{try{u();}catch{}});
    patches.length=0;
  },
};

exports.default=plugin;
