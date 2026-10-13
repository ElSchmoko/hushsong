import sys, glob
from PIL import Image
pat, out = sys.argv[1], sys.argv[2]; cols=int(sys.argv[3]) if len(sys.argv)>3 else 4; scale=float(sys.argv[4]) if len(sys.argv)>4 else 0.5
start=int(sys.argv[5]) if len(sys.argv)>5 else 0; cnt=int(sys.argv[6]) if len(sys.argv)>6 else 99
fs=sorted(glob.glob(pat))[start:start+cnt]
if not fs: sys.exit('no files')
ims=[Image.open(f) for f in fs]; w,h=ims[0].size; w2,h2=int(w*scale),int(h*scale); rows=(len(ims)+cols-1)//cols
S=Image.new('RGB',(cols*w2,rows*h2),(0,0,0))
for i,im in enumerate(ims): S.paste(im.resize((w2,h2),Image.NEAREST),((i%cols)*w2,(i//cols)*h2))
S.save(out); print(len(fs),'->',out)
