// Author:YuWen Huang
// Title: modified_map&virus 
#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;
uniform sampler2D u_tex0; //MonaLisa
uniform sampler2D u_tex1;

vec2 hash2( vec2 x )           //亂數範圍 [0,1]
{
    const vec2 k = vec2( 0.3183099, 0.3678794 );
    x = x*k + k.yx;
    return fract( 16.0 * k*fract( x.x*x.y*(x.x+x.y)) );
}
float gnoise( in vec2 p )       //亂數範圍 [0,1]
{
    vec2 i = floor( p );
    vec2 f = fract( p );   
    vec2 u = f*f*(3.0-2.0*f);
    return mix( mix( dot( hash2( i + vec2(0.0,0.0) ), f - vec2(0.0,0.0) ), 
                     dot( hash2( i + vec2(1.0,0.0) ), f - vec2(1.0,0.0) ), u.x),
                mix( dot( hash2( i + vec2(0.0,1.0) ), f - vec2(0.0,1.0) ), 
                     dot( hash2( i + vec2(1.0,1.0) ), f - vec2(1.0,1.0) ), u.x), u.y);
}

//hatching_virus
float texhv(in vec2 p, in float str)
{
    float rz= 1.0;
    int j=20;
    for (int i=0;i<20;i++){
        float pas=float(i)/float(j);
        float g = gnoise(vec2(1., 40.)*p); //亂數範圍 [0,1]
        g=smoothstep(0.05, 0.5, g); //light color
        p.xy = p.yx;
        p += 0.07;
        p*= 1.2;
        rz = min(1.-g,rz);
        if ( 1.0-pas < str) break;     
    }
    return rz;
}

//hatching horizontal_map
float texh(in vec2 p, in float str)
{
    float rz= 1.0;
    int j=20;
    for (int i=0;i<15;i++){
        float pas=float(i)/float(j);
        float g = gnoise(vec2(1., 80.)*p); //亂數範圍 [0,1]
        g=smoothstep(0.05, 0.1, g*0.9); //deep color
        //p.xy = p.yx; //horizontal only
        p += 0.07;
        p*= 1.2;
        rz = min(1.-g,rz);
        if ( 1.0-pas < str) break;     
    }
    return rz;
}

void main() {
    vec2 uv = gl_FragCoord.xy/u_resolution.xy;
    //uv.x *= u_resolution.x/u_resolution.y;
    //uv= uv*2.0-1.0;
    float breathing=(exp(sin(u_time/6.0*3.14159)) - 0.36787944)*0.42545906412;

    vec4 tex0 = texture2D(u_tex0, uv);
    vec4 tex1 = texture2D(u_tex1, uv);
  
    // Apply hatching to both textures
    //vec3 hatch0 = vec3(texhv(uv*5.0, tex0.g+0.3-breathing*0.3));
    vec3 hatch0 = vec3(texhv(uv*5.0, tex0.g+0.3)); //virus don't move
    vec3 hatch1 = vec3(texh(uv*5.0, tex1.g+0.4-breathing*0.4)); //map appear and disappear

    // Mix the hatched textures 
    vec3 col = mix(hatch0, hatch1, 0.5);
    
    gl_FragColor = vec4(col, 1.0);
}



