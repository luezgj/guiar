package com.wikitude.samples;

import android.content.Intent;
import android.os.Bundle;

import com.wikitude.samples.SimpleGeoArActivity;

public class GuiderActivity extends SimpleGeoArActivity {

    public static final String INTENT_EXTRAS_KEY_TARGETID = "targetData";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        final Intent intent = getIntent();
        if (!intent.hasExtra(INTENT_EXTRAS_KEY_TARGETID)) {
            throw new IllegalStateException(getClass().getSimpleName() +
                    " can not be created without valid int as intent extra for key " + INTENT_EXTRAS_KEY_TARGETID + ".");
        }

        final int target = (int) intent.getSerializableExtra(INTENT_EXTRAS_KEY_TARGETID);
        String str = "setTarget("+target+")";
        
        
        super.architectView.callJavascript(str);
   	}
}
