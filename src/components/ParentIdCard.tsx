"use client";

import { QRCodeSVG } from "qrcode.react";

export interface IDCardSettings {
  schoolName: string;
  schoolAddress: string;
  schoolLogo: string;
  principalName: string;
  principalSignature: string;
  ptaPresidentName: string;
  ptaPresidentSignature: string;
  idCardTemplate?: string;
  customTemplateFront?: string;
  customTemplateBack?: string;
}

export default function ParentIdCard({ parent, settings }: { parent: any; settings: IDCardSettings }) {
  const template = settings.idCardTemplate || "wave-blue";
  const parentPhoto = parent.photo || "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23ccc'><path d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/></svg>";

  const FrontSide = () => {
    switch (template) {
      case "wave-blue":
        return (
          <div className="w-[2.125in] h-[3.375in] bg-white relative overflow-hidden flex flex-col items-center border border-slate-200 shrink-0 shadow-sm print:border-none print:shadow-none" style={{ pageBreakInside: "avoid" }}>
            {/* Top Waves with Gradients */}
            <div className="absolute top-0 left-0 right-0 h-[38%] bg-gradient-to-br from-cyan-400 via-blue-600 to-blue-800 rounded-b-[60%] scale-x-[1.8] origin-top z-0"></div>
            <div className="absolute top-0 left-[-10%] right-[-10%] h-[42%] bg-gradient-to-r from-cyan-300 to-blue-400 rounded-b-[50%] scale-x-[1.4] origin-top -z-10 rotate-3 opacity-90"></div>
            
            <div className="relative z-10 w-full px-2 pt-3 flex flex-col items-center">
              {settings.schoolLogo && <img src={settings.schoolLogo} alt="Logo" className="w-8 h-8 object-contain bg-white rounded-full p-0.5 mb-1 shadow-sm" />}
              <h2 className="text-[7px] text-white font-bold text-center leading-tight tracking-wide px-2 uppercase drop-shadow-md">{settings.schoolName || "School Name"}</h2>
              
              <div className="mt-3 p-1 bg-white rounded-full shadow-[0_4px_10px_rgba(0,0,0,0.1)]">
                <img src={parentPhoto} alt="Parent" className="w-20 h-20 object-cover rounded-full" />
              </div>
              
              <h1 className="mt-3 text-sm font-black text-slate-900 text-center leading-tight uppercase px-1">{parent.name}</h1>
              <p className="text-[6px] text-blue-600 font-bold uppercase tracking-widest mt-0.5">PARENT / GUARDIAN</p>
              
              <div className="mt-3 text-[6px] text-slate-600 space-y-0.5 text-center w-full px-3">
                <p><strong>ID No:</strong> {parent.id.split('-')[0].toUpperCase()}</p>
                <p className="truncate"><strong>Contact:</strong> {parent.contactInfo || "N/A"}</p>
              </div>

              <div className="mt-auto mb-6 relative z-10 flex flex-col items-center">
                <h2 className="text-xl font-black text-blue-900 uppercase tracking-widest drop-shadow-sm">SPTA</h2>
                <p className="text-[5px] text-blue-800 font-bold uppercase text-center mt-0.5 max-w-[1.8in] leading-tight">School Parents Teachers Association</p>
              </div>
            </div>
            
            {/* Bottom Waves */}
            <div className="absolute bottom-0 left-[-20%] right-[-20%] h-16 bg-gradient-to-tr from-blue-700 to-cyan-500 rounded-t-[60%] scale-x-[1.5] origin-bottom z-0 opacity-90"></div>
            <div className="absolute bottom-[-10px] left-[-10%] right-[-10%] h-16 bg-gradient-to-t from-cyan-300 to-blue-400 rounded-t-[50%] scale-x-[1.2] origin-bottom -z-10 -rotate-6 opacity-60"></div>
          </div>
        );

      case "solid-navy":
        return (
          <div className="w-[2.125in] h-[3.375in] bg-white relative overflow-hidden flex flex-col items-center border border-slate-200 shrink-0 shadow-sm print:border-none print:shadow-none" style={{ pageBreakInside: "avoid" }}>
            <div className="w-full h-12 bg-slate-800 flex items-center px-2">
              {settings.schoolLogo && <img src={settings.schoolLogo} alt="Logo" className="w-6 h-6 object-contain bg-white rounded-full p-0.5 mr-2" />}
              <h2 className="text-[7px] text-white font-bold leading-tight tracking-wide uppercase">{settings.schoolName || "School Name"}</h2>
            </div>
            
            <div className="mt-4 p-1">
              <img src={parentPhoto} alt="Parent" className="w-24 h-24 object-cover rounded-xl shadow-sm border border-slate-200" />
            </div>
            
            <h1 className="mt-3 text-[13px] font-black text-slate-900 text-center leading-tight px-1">{parent.name}</h1>
            <p className="text-[6px] text-slate-500 font-bold uppercase tracking-widest mt-1">PARENT</p>
            
            <div className="mt-3 text-[6px] text-slate-600 space-y-0.5 w-full px-4 text-left">
              <p><strong>ID No:</strong> {parent.id.split('-')[0].toUpperCase()}</p>
              <p className="truncate"><strong>Contact:</strong> {parent.contactInfo || "N/A"}</p>
            </div>

            <div className="mt-auto mb-8 relative z-10 flex flex-col items-center bg-white/90 p-1 rounded">
              <h2 className="text-lg font-black text-slate-800 uppercase tracking-widest">SPTA</h2>
              <p className="text-[5px] text-slate-600 font-bold uppercase text-center mt-0.5">School Parents Teachers Association</p>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-4 bg-slate-800"></div>
          </div>
        );

      case "modern-gray":
        return (
          <div className="w-[2.125in] h-[3.375in] bg-slate-50 relative overflow-hidden flex flex-col items-center border border-slate-200 shrink-0 shadow-sm print:border-none print:shadow-none" style={{ pageBreakInside: "avoid" }}>
            <div className="w-full pt-2 flex flex-col items-center">
              {settings.schoolLogo && <img src={settings.schoolLogo} alt="Logo" className="w-8 h-8 object-contain mb-1" />}
              <h2 className="text-[7px] text-slate-800 font-bold text-center leading-tight uppercase px-2">{settings.schoolName || "School Name"}</h2>
            </div>
            
            <div className="mt-2 bg-slate-200 rounded-t-full w-28 pt-2 px-2 flex flex-col items-center">
              <img src={parentPhoto} alt="Parent" className="w-24 h-24 object-cover rounded-t-full" />
            </div>
            
            <div className="bg-white w-full flex-1 flex flex-col items-center pt-2 px-2 rounded-t-3xl shadow-[0_-4px_10px_rgba(0,0,0,0.05)] relative z-10">
              <h1 className="text-sm font-black text-slate-800 text-center leading-tight px-1">{parent.name}</h1>
              <p className="text-[6px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">GUARDIAN</p>
              
              <div className="mt-2 text-[5px] text-slate-600 w-full space-y-0.5 text-center">
                <p>ID: {parent.id.split('-')[0].toUpperCase()}</p>
                <p className="truncate">Contact: {parent.contactInfo || "N/A"}</p>
              </div>

              <div className="mt-auto mb-4 flex flex-col items-center">
                <h2 className="text-lg font-black text-slate-800 uppercase tracking-widest">SPTA</h2>
                <p className="text-[5px] text-slate-500 font-bold uppercase text-center mt-0.5">School Parents Teachers Association</p>
              </div>
            </div>
          </div>
        );

      case "teal-angles":
        return (
          <div className="w-[2.125in] h-[3.375in] bg-white relative overflow-hidden flex flex-col items-center border border-slate-200 shrink-0 shadow-sm print:border-none print:shadow-none" style={{ pageBreakInside: "avoid" }}>
            <div className="absolute top-0 left-0 w-16 h-16 bg-teal-800 origin-top-left -rotate-45 -translate-y-8 -translate-x-8"></div>
            <div className="absolute bottom-0 right-0 w-16 h-16 bg-teal-800 origin-bottom-right -rotate-45 translate-y-8 translate-x-8"></div>
            <div className="absolute top-0 right-0 w-10 h-10 bg-teal-500 origin-top-right rotate-45 translate-y-[-10px] translate-x-[10px]"></div>

            <div className="relative z-10 w-full pt-4 flex flex-col items-center">
              <h2 className="text-[7px] text-teal-900 font-black tracking-widest uppercase mb-3">{settings.schoolName || "School Name"}</h2>
              
              <div className="p-1 border-2 border-teal-800 rounded-2xl">
                <img src={parentPhoto} alt="Parent" className="w-20 h-20 object-cover rounded-xl" />
              </div>
              
              <h1 className="mt-3 text-sm font-black text-teal-900 text-center leading-tight px-1">{parent.name}</h1>
              <p className="text-[6px] text-teal-700 font-bold uppercase tracking-widest mt-0.5">PARENT</p>
              
              <div className="mt-3 text-[5px] text-slate-600 space-y-0.5 text-center w-full px-4">
                <p>ID No: {parent.id.split('-')[0].toUpperCase()}</p>
                <p className="truncate">Contact: {parent.contactInfo || "N/A"}</p>
              </div>

              <div className="mt-auto mb-6 flex flex-col items-center relative z-10">
                <h2 className="text-xl font-black text-teal-900 uppercase tracking-widest">SPTA</h2>
                <p className="text-[5px] text-teal-800 font-bold uppercase text-center mt-0.5">School Parents Teachers Association</p>
              </div>
            </div>
          </div>
        );

      case "diamond-blue":
        return (
          <div className="w-[2.125in] h-[3.375in] bg-white relative overflow-hidden flex flex-col items-center border border-slate-200 shrink-0 shadow-sm print:border-none print:shadow-none" style={{ pageBreakInside: "avoid" }}>
            <div className="absolute top-[-20px] left-[-20px] w-20 h-20 bg-blue-500 rotate-45 opacity-20"></div>
            <div className="absolute top-[-10px] right-[-30px] w-16 h-16 bg-blue-600 rotate-45"></div>
            <div className="absolute bottom-[-20px] left-[-20px] w-16 h-16 bg-blue-600 rotate-45"></div>
            <div className="absolute bottom-[-10px] right-[-30px] w-20 h-20 bg-blue-500 rotate-45 opacity-20"></div>

            <div className="relative z-10 w-full pt-4 flex flex-col items-center px-2">
              <div className="flex items-center space-x-1 mb-2">
                {settings.schoolLogo && <img src={settings.schoolLogo} alt="Logo" className="w-5 h-5 object-contain" />}
                <h2 className="text-[6px] text-slate-800 font-black uppercase leading-tight">{settings.schoolName || "School Name"}</h2>
              </div>
              
              <div className="w-24 h-24 overflow-hidden rotate-45 border-4 border-blue-600 rounded mt-3">
                <img src={parentPhoto} alt="Parent" className="w-[140%] h-[140%] max-w-none -rotate-45 origin-center object-cover -ml-[20%] -mt-[20%]" />
              </div>
              
              <h1 className="mt-6 text-sm font-black text-slate-800 text-center leading-tight">{parent.name}</h1>
              <p className="text-[6px] text-blue-600 font-bold uppercase tracking-widest mt-0.5">GUARDIAN</p>
              
              <div className="mt-auto mb-6 flex flex-col items-center">
                <h2 className="text-lg font-black text-blue-800 uppercase tracking-widest">SPTA</h2>
                <p className="text-[5px] text-blue-600 font-bold uppercase text-center mt-0.5">School Parents Teachers Association</p>
              </div>
            </div>
          </div>
        );

      case "gold-blue":
        return (
          <div className="w-[2.125in] h-[3.375in] bg-white relative overflow-hidden flex flex-col items-center border border-slate-200 shrink-0 shadow-sm print:border-none print:shadow-none" style={{ pageBreakInside: "avoid" }}>
            <div className="absolute top-0 left-0 w-0 h-0 border-l-[60px] border-l-blue-700 border-b-[60px] border-b-transparent"></div>
            <div className="absolute top-0 right-0 w-0 h-0 border-r-[60px] border-r-amber-400 border-b-[60px] border-b-transparent"></div>
            <div className="absolute bottom-0 left-0 w-0 h-0 border-l-[60px] border-l-amber-400 border-t-[60px] border-t-transparent"></div>
            <div className="absolute bottom-0 right-0 w-0 h-0 border-r-[60px] border-r-blue-700 border-t-[60px] border-t-transparent"></div>

            <div className="relative z-10 w-full pt-4 flex flex-col items-center">
              {settings.schoolLogo && <img src={settings.schoolLogo} alt="Logo" className="w-6 h-6 object-contain mb-1" />}
              <h2 className="text-[6px] text-blue-900 font-black tracking-widest uppercase">{settings.schoolName || "School Name"}</h2>
              
              <div className="mt-3 p-1 rounded-full border-2 border-amber-400">
                <img src={parentPhoto} alt="Parent" className="w-20 h-20 object-cover rounded-full border-2 border-blue-700" />
              </div>
              
              <h1 className="mt-3 text-[13px] font-black text-blue-900 text-center leading-tight px-2">{parent.name}</h1>
              <p className="text-[5px] text-blue-700 font-bold uppercase tracking-widest mt-1">PARENT</p>
              
              <div className="mt-auto mb-6 relative flex flex-col items-center">
                <div className="absolute inset-0 bg-white/70 backdrop-blur-sm -m-2 rounded-lg -z-10"></div>
                <h2 className="text-xl font-black text-blue-900 uppercase tracking-widest">SPTA</h2>
                <p className="text-[5px] text-blue-800 font-bold uppercase text-center mt-0.5">School Parents Teachers Association</p>
              </div>
            </div>
          </div>
        );

      case "custom":
        return (
          <div 
            className="w-[2.125in] h-[3.375in] bg-white relative overflow-hidden flex flex-col items-center border border-slate-200 shrink-0 shadow-sm print:border-none print:shadow-none bg-cover bg-center" 
            style={{ 
              pageBreakInside: "avoid",
              backgroundImage: settings.customTemplateFront ? `url(${settings.customTemplateFront})` : "none"
            }}
          >
            <div className="relative z-10 w-full h-full pt-2 pb-6 flex flex-col items-center">
              {!settings.customTemplateFront && (
                <div className="text-[8px] text-slate-400 absolute top-2 w-full text-center px-2">
                  No custom template uploaded in settings
                </div>
              )}

              <div className="flex flex-col items-center w-[90%] mb-2 z-20">
                {settings.schoolLogo && <img src={settings.schoolLogo} alt="Logo" className="w-7 h-7 object-contain drop-shadow-md mix-blend-multiply mb-1" />}
                <h2 className="text-[9px] font-black text-slate-900 uppercase tracking-wider leading-tight text-center drop-shadow-md">{settings.schoolName || "School Name"}</h2>
                {settings.schoolAddress && (
                  <p className="text-[5px] text-slate-800 mt-0.5 text-center leading-tight drop-shadow-md font-medium">{settings.schoolAddress}</p>
                )}
              </div>
              
              <div className="mt-[2%] p-0.5 bg-white/50 rounded-full shadow-sm backdrop-blur-sm border border-white/50">
                <img src={parentPhoto} alt="Parent" className="w-[84px] h-[84px] object-cover rounded-full" />
              </div>
              
              <div className="mt-4 flex flex-col items-center w-[90%]">
                <h1 className="text-sm font-black text-slate-900 text-center leading-tight px-1 uppercase drop-shadow-md">{parent.name}</h1>
                <p className="text-[6px] text-slate-800 font-bold uppercase tracking-widest mt-0.5 drop-shadow-md">PARENT / GUARDIAN</p>
                <div className="mt-1.5 text-[6px] text-slate-800 flex flex-col items-center drop-shadow-md font-medium space-y-0.5">
                  <p>ID: {parent.id.split('-')[0].toUpperCase()}</p>
                  <p className="font-bold">Organization: SPTA</p>
                </div>
              </div>

              <div className="mt-auto bg-white/90 backdrop-blur-sm p-2 rounded-lg shadow-sm border border-slate-200 flex flex-col items-center">
                <h2 className="text-lg font-black text-slate-900 uppercase tracking-widest">SPTA</h2>
                <p className="text-[5px] text-slate-700 font-bold uppercase text-center mt-0.5">School Parents Teachers Association</p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const BackSide = () => {
    if (template === "custom") {
      return (
        <div 
          className="w-[2.125in] h-[3.375in] bg-white relative overflow-hidden flex flex-col items-center border border-slate-200 shrink-0 shadow-sm print:border-none print:shadow-none p-3 bg-cover bg-center" 
          style={{ 
            pageBreakInside: "avoid",
            backgroundImage: settings.customTemplateBack ? `url(${settings.customTemplateBack})` : "none"
          }}
        >
          {/* QR Code */}
          <div className="w-full mt-2 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm rounded-xl p-2 border border-white/50 shadow-sm">
            <QRCodeSVG value={parent.qrCodeId} size={80} />
            <p className="text-[5px] text-slate-500 font-bold mt-1 tracking-widest">{parent.id.split('-')[0].toUpperCase()}</p>
          </div>

          {/* Children List */}
          <div className="w-full mt-4 flex-1 flex flex-col items-center bg-white/80 backdrop-blur-sm rounded-xl p-2 border border-white/50 shadow-sm">
            <h3 className="text-[7px] font-black text-slate-800 uppercase tracking-widest mb-1.5 text-center">Authorized Children</h3>
            <div className="space-y-1 w-full">
              {parent.children?.slice(0, 4).map((child: any) => (
                <div key={child.id} className="text-[6px] text-slate-700 font-medium flex justify-between border-b border-slate-200 last:border-0 pb-0.5">
                  <span className="truncate pr-1 uppercase">{child.name}</span>
                  <span className="text-slate-500 shrink-0">{child.grade}</span>
                </div>
              ))}
              {(!parent.children || parent.children.length === 0) && (
                <div className="text-[6px] text-slate-400 italic text-center py-2">No children listed</div>
              )}
            </div>
            
            <div className="mt-2 pt-1 border-t border-slate-100 text-[5px] text-slate-500 text-center leading-tight w-full">
              <strong>Authorized Use:</strong> The ID card is strictly for official use and should not be shared or used for unauthorized purposes.
            </div>
          </div>

          {/* Signatures */}
          <div className="w-full flex justify-between items-end mt-auto pt-2 mb-2 bg-white/80 backdrop-blur-sm rounded-xl p-2 border border-white/50 shadow-sm">
            <div className="flex flex-col items-center w-[45%]">
              {settings.principalSignature ? (
                <img src={settings.principalSignature} alt="Sig" className="h-4 object-contain mb-[-2px] grayscale mix-blend-multiply" />
              ) : <div className="h-4"></div>}
              <p className="text-[5px] font-bold text-slate-800 truncate w-full text-center border-b border-slate-800 pb-0.5">
                {settings.principalName || "Principal"}
              </p>
              <p className="text-[4px] text-slate-500 uppercase tracking-widest mt-[1px]">Principal</p>
            </div>

            <div className="flex flex-col items-center w-[45%]">
              {settings.ptaPresidentSignature ? (
                <img src={settings.ptaPresidentSignature} alt="Sig" className="h-4 object-contain mb-[-2px] grayscale mix-blend-multiply" />
              ) : <div className="h-4"></div>}
              <p className="text-[5px] font-bold text-slate-800 truncate w-full text-center border-b border-slate-800 pb-0.5">
                {settings.ptaPresidentName || "PTA President"}
              </p>
              <p className="text-[4px] text-slate-500 uppercase tracking-widest mt-[1px]">PTA President</p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="w-[2.125in] h-[3.375in] bg-slate-50 relative overflow-hidden flex flex-col items-center border border-slate-200 shrink-0 shadow-sm print:border-none print:shadow-none p-3" style={{ pageBreakInside: "avoid" }}>
        
        {/* Header */}
        <div className="flex flex-col items-center mt-2 border-b border-slate-200 pb-2 w-full">
          {settings.schoolLogo && <img src={settings.schoolLogo} alt="Logo" className="w-6 h-6 object-contain mb-1 grayscale" />}
          <h2 className="text-[7px] text-slate-800 font-bold text-center leading-tight tracking-wider uppercase">
            {settings.schoolName || "School Name"}
          </h2>
          <p className="text-[5px] text-slate-500 mt-0.5 text-center px-2">
            {settings.schoolAddress || "School Address Not Set"}
          </p>
        </div>

        {/* QR Code */}
        <div className="w-full mt-2 flex flex-col items-center justify-center">
          <QRCodeSVG value={parent.qrCodeId} size={80} className="p-1 bg-white border border-slate-200 rounded shadow-sm" />
          <p className="text-[5px] text-slate-500 font-bold mt-1 tracking-widest">{parent.id.split('-')[0].toUpperCase()}</p>
        </div>

        {/* Children List */}
        <div className="w-full mt-1 flex-1">
          <h3 className="text-[7px] font-black text-slate-800 uppercase tracking-widest mb-1.5 text-center">Authorized Children</h3>
          <div className="space-y-1 w-full bg-white border border-slate-100 rounded p-1.5">
            {parent.children?.slice(0, 4).map((child: any) => (
              <div key={child.id} className="text-[6px] text-slate-700 font-medium flex justify-between border-b border-slate-50 last:border-0 pb-0.5">
                <span className="truncate pr-1 uppercase">{child.name}</span>
                <span className="text-slate-400 shrink-0">{child.grade}</span>
              </div>
            ))}
            {parent.children?.length > 4 && (
              <div className="text-[5px] text-slate-400 italic text-center pt-0.5">...and {parent.children.length - 4} more</div>
            )}
            {(!parent.children || parent.children.length === 0) && (
              <div className="text-[6px] text-slate-400 italic text-center py-2">No children listed</div>
            )}
          </div>
          
          <div className="mt-2 text-[5px] text-slate-500 text-center px-2 leading-tight">
            <strong>Authorized Use:</strong> The ID card is strictly for official use and should not be shared or used for unauthorized purposes.
          </div>
        </div>

        {/* Signatures */}
        <div className="w-full flex justify-between items-end mt-auto pt-2 border-t border-slate-200 mb-2">
          <div className="flex flex-col items-center w-[45%]">
            {settings.principalSignature ? (
              <img src={settings.principalSignature} alt="Sig" className="h-4 object-contain mb-[-2px] grayscale mix-blend-multiply" />
            ) : <div className="h-4"></div>}
            <p className="text-[5px] font-bold text-slate-800 truncate w-full text-center border-b border-slate-800 pb-0.5">
              {settings.principalName || "Principal"}
            </p>
            <p className="text-[4px] text-slate-500 uppercase tracking-widest mt-[1px]">Principal</p>
          </div>

          <div className="flex flex-col items-center w-[45%]">
            {settings.ptaPresidentSignature ? (
              <img src={settings.ptaPresidentSignature} alt="Sig" className="h-4 object-contain mb-[-2px] grayscale mix-blend-multiply" />
            ) : <div className="h-4"></div>}
            <p className="text-[5px] font-bold text-slate-800 truncate w-full text-center border-b border-slate-800 pb-0.5">
              {settings.ptaPresidentName || "PTA President"}
            </p>
            <p className="text-[4px] text-slate-500 uppercase tracking-widest mt-[1px]">PTA President</p>
          </div>
        </div>
        
        {/* Subtle bottom wave to tie to front templates */}
        <div className="absolute bottom-0 left-0 right-0 h-4 bg-slate-200 rounded-t-full scale-x-150 origin-bottom opacity-50 z-0"></div>
      </div>
    );
  };

  return (
    <div className="flex flex-row space-x-4 print:space-x-4 print:flex-row">
      <FrontSide />
      <BackSide />
    </div>
  );
}
